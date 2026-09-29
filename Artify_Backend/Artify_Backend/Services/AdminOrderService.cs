using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class AdminOrderService(ApplicationDbContext db, IOrderService orders) : IAdminOrderService
{
    public async Task<PagedResult<AdminOrderListDto>> GetListAsync(AdminOrderQuery q)
    {
        var page = Math.Max(q.Page, 1);
        var size = Math.Clamp(q.PageSize, 1, 50);

        var src = db.Orders.AsNoTracking().AsQueryable();
        if (q.Status.HasValue) src = src.Where(o => o.OrderStatus == q.Status);
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim();
            src = src.Where(o => o.OrderNumber.Contains(s) || o.User.Email.Contains(s) || o.User.FirstName.Contains(s));
        }

        var total = await src.CountAsync();
        var items = await src.OrderByDescending(o => o.CreatedAt).Skip((page - 1) * size).Take(size)
            .Select(o => new AdminOrderListDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                CustomerName = o.User.FirstName + " " + o.User.LastName,
                CustomerEmail = o.User.Email,
                TotalAmount = o.TotalAmount,
                OrderStatus = o.OrderStatus,
                PaymentStatus = o.PaymentStatus,
                HasCustomPrint = o.Items.Any(i => i.ItemType == CartItemType.CustomPrint),
                CreatedAt = o.CreatedAt
            }).ToListAsync();

        return new PagedResult<AdminOrderListDto> { Items = items, Page = page, PageSize = size, TotalCount = total };
    }

    public async Task<OrderDetailDto> AdvanceStatusAsync(int orderId, AdvanceOrderStatusDto dto)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderId == orderId)
            ?? throw new KeyNotFoundException("Order not found");

        if (order.OrderStatus == OrderStatus.Cancelled)
            throw new InvalidOperationException("A cancelled order cannot be advanced");

        var hasCustomPrint = order.Items.Any(i => i.ItemType == CartItemType.CustomPrint);
        var next = dto.TargetStatus ?? OrderStatusFlow.Next(order.OrderStatus, hasCustomPrint);

        if (next is null) throw new InvalidOperationException("This order has already reached its final status");

        // Only allow moving to the immediate next step in this order's own flow — no skipping stages
        var expectedNext = OrderStatusFlow.Next(order.OrderStatus, hasCustomPrint);
        if (next != expectedNext)
            throw new InvalidOperationException($"Orders must move through each stage in order. Next allowed status: {expectedNext}");

        order.OrderStatus = next.Value;
        order.UpdatedAt = DateTime.UtcNow;

        // Delivery is when Cash on Delivery payment is collected
        if (next == OrderStatus.Delivered && order.PaymentStatus == PaymentStatus.Pending)
            order.PaymentStatus = PaymentStatus.Paid;

        await db.SaveChangesAsync();

        // Reuse the customer-facing projection so admins and customers see identically shaped data
        return await orders.GetByIdAsync(order.UserId, order.OrderId);
    }
}