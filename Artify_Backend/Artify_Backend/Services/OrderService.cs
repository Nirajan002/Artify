using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Helpers;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Artify.API.Services;

public class OrderService(
    ApplicationDbContext db, IPrintPricingService pricing, IPaymentService payments, IOptions<ShippingSettings> shipping)
    : IOrderService
{
    private readonly ShippingSettings _shipping = shipping.Value;

    public async Task<OrderDetailDto> CreateAsync(int userId, CreateOrderDto dto)
    {
        var address = await db.Addresses.AsNoTracking()
            .FirstOrDefaultAsync(a => a.AddressId == dto.AddressId && a.UserId == userId)
            ?? throw new InvalidOperationException("Select a valid shipping address");

        var cart = await db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Artwork)
            .Include(c => c.Items).ThenInclude(i => i.ArtworkVariant)
            .Include(c => c.Items).ThenInclude(i => i.Material)
            .Include(c => c.Items).ThenInclude(i => i.Frame)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null || cart.Items.Count == 0) throw new InvalidOperationException("Your cart is empty");

        // 1. Revalidate and reprice every line against current data. The cart's stored price is never trusted.
        var lines = new List<(CartItem Item, decimal UnitPrice)>();
        foreach (var item in cart.Items)
        {
            if (item.ItemType == CartItemType.Artwork)
            {
                var issue = CartRules.GetIssue(item);
                if (issue is not null) throw new InvalidOperationException($"{item.Artwork?.Title ?? "An item"}: {issue}");
                lines.Add((item, item.ArtworkVariant!.BasePrice));
            }
            else
            {
                var (unitPrice, issue) = pricing.EvaluateCartItem(item);
                if (issue is not null) throw new InvalidOperationException($"Custom print: {issue}");
                lines.Add((item, unitPrice!.Value));
            }
        }

        var subtotal = lines.Sum(l => l.UnitPrice * l.Item.Quantity);
        var shippingFee = subtotal >= _shipping.FreeThreshold ? 0 : _shipping.FlatFee;
        var total = subtotal + shippingFee;

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            // 2. Decrement stock atomically. If someone else bought the last one first, this fails safely
            //    and rolls back everything done so far in this transaction.
            foreach (var (item, _) in lines.Where(l => l.Item.ItemType == CartItemType.Artwork))
            {
                var variantId = item.ArtworkVariantId!.Value;
                var updated = await db.ArtworkVariants
                    .Where(v => v.ArtworkVariantId == variantId && v.StockQuantity >= item.Quantity)
                    .ExecuteUpdateAsync(s => s.SetProperty(v => v.StockQuantity, v => v.StockQuantity - item.Quantity));
                if (updated == 0)
                    throw new InvalidOperationException($"{item.Artwork!.Title} no longer has enough stock");

                if (item.ArtworkVariant!.VariantType == VariantType.Original)
                    await db.Artworks.Where(a => a.ArtworkId == item.ArtworkId)
                        .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsOriginalAvailable, false));
            }

            // 3. Build the order, snapshotting everything so later edits elsewhere never change this order
            var order = new Order
            {
                UserId = userId,
                OrderNumber = GenerateOrderNumber(),
                ShippingAddress = FormatAddress(address),
                Subtotal = subtotal,
                ShippingFee = shippingFee,
                Discount = 0,
                TotalAmount = total,
                OrderStatus = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending
            };

            foreach (var (item, unitPrice) in lines)
                order.Items.Add(new OrderItem
                {
                    ItemType = item.ItemType,
                    ArtworkId = item.ArtworkId,
                    ArtworkVariantId = item.ArtworkVariantId,
                    VariantType = item.ArtworkVariant?.VariantType,
                    ItemTitle = item.ItemType == CartItemType.Artwork ? item.Artwork!.Title : "Custom print",
                    ItemImageUrl = item.ItemType == CartItemType.Artwork
                        ? (item.Artwork!.ThumbnailUrl ?? item.Artwork.ImageUrl)
                        : item.CustomArtworkUrl,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = unitPrice * item.Quantity,
                    CustomArtworkUrl = item.CustomArtworkUrl,
                    CustomWidth = item.CustomWidth,
                    CustomHeight = item.CustomHeight,
                    MaterialId = item.MaterialId,
                    MaterialName = item.Material?.Name,
                    FrameId = item.FrameId,
                    FrameName = item.Frame?.Name
                });

            db.Orders.Add(order);
            await db.SaveChangesAsync();   // order.OrderId is assigned here

            db.Payments.Add(payments.Process(order, dto.PaymentMethod));
            db.CartItems.RemoveRange(cart.Items);   // checkout takes the whole cart
            await db.SaveChangesAsync();

            await tx.CommitAsync();
            return await GetByIdAsync(userId, order.OrderId);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<PagedResult<OrderListDto>> GetListAsync(int userId, OrderQuery q)
    {
        var page = Math.Max(q.Page, 1);
        var size = Math.Clamp(q.PageSize, 1, 30);

        var src = db.Orders.AsNoTracking().Where(o => o.UserId == userId);
        if (q.Status.HasValue) src = src.Where(o => o.OrderStatus == q.Status);

        var total = await src.CountAsync();
        var items = await src.OrderByDescending(o => o.CreatedAt).Skip((page - 1) * size).Take(size)
            .Select(o => new OrderListDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                TotalAmount = o.TotalAmount,
                OrderStatus = o.OrderStatus,
                PaymentStatus = o.PaymentStatus,
                ItemCount = o.Items.Sum(i => i.Quantity),
                ThumbnailUrl = o.Items.Select(i => i.ItemImageUrl ?? "").FirstOrDefault() ?? "",
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<OrderListDto> { Items = items, Page = page, PageSize = size, TotalCount = total };
    }

    public async Task<OrderDetailDto> GetByIdAsync(int userId, int orderId)
    {
        var order = await db.Orders.AsNoTracking()
            .Where(o => o.OrderId == orderId && o.UserId == userId)
            .Select(o => new
            {
                o.OrderId,
                o.OrderNumber,
                o.ShippingAddress,
                o.Subtotal,
                o.ShippingFee,
                o.Discount,
                o.TotalAmount,
                o.OrderStatus,
                o.PaymentStatus,
                o.CreatedAt,
                PaymentMethod = o.Payment != null ? o.Payment.PaymentMethod : PaymentMethod.CashOnDelivery,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    OrderItemId = i.OrderItemId,
                    ItemType = i.ItemType,
                    ArtworkId = i.ArtworkId,
                    Title = i.ItemTitle ?? "Item",
                    ImageUrl = i.ItemImageUrl ?? "",
                    VariantType = i.VariantType,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    CustomWidth = i.CustomWidth,
                    CustomHeight = i.CustomHeight,
                    MaterialName = i.MaterialName,
                    FrameName = i.FrameName
                }).ToList()
            })
            .FirstOrDefaultAsync() ?? throw new KeyNotFoundException("Order not found");

        var hasCustomPrint = order.Items.Any(i => i.ItemType == CartItemType.CustomPrint);
        return new OrderDetailDto
        {
            OrderId = order.OrderId,
            OrderNumber = order.OrderNumber,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus,
            PaymentStatus = order.PaymentStatus,
            ItemCount = order.Items.Sum(i => i.Quantity),
            ThumbnailUrl = order.Items.FirstOrDefault()?.ImageUrl ?? "",
            CreatedAt = order.CreatedAt,
            ShippingAddress = order.ShippingAddress,
            Subtotal = order.Subtotal,
            ShippingFee = order.ShippingFee,
            Discount = order.Discount,
            PaymentMethod = order.PaymentMethod,
            Items = order.Items,
            StatusFlow = OrderStatusFlow.For(hasCustomPrint).Select(s => s.ToString()).ToList(),
            CanCancel = OrderStatusFlow.CanCancel(order.OrderStatus)
        };
    }

    public async Task<OrderDetailDto> CancelAsync(int userId, int orderId)
    {
        var order = await db.Orders.Include(o => o.Items).Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId)
            ?? throw new KeyNotFoundException("Order not found");

        if (!OrderStatusFlow.CanCancel(order.OrderStatus))
            throw new InvalidOperationException($"An order that is {order.OrderStatus} can no longer be cancelled");

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in order.Items.Where(i => i.ItemType == CartItemType.Artwork && i.ArtworkVariantId != null))
            {
                await db.ArtworkVariants.Where(v => v.ArtworkVariantId == item.ArtworkVariantId)
                    .ExecuteUpdateAsync(s => s.SetProperty(v => v.StockQuantity, v => v.StockQuantity + item.Quantity));

                if (item.VariantType == VariantType.Original)
                    await db.Artworks.Where(a => a.ArtworkId == item.ArtworkId)
                        .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsOriginalAvailable, true));
            }

            order.OrderStatus = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;
            if (order.Payment is { PaymentStatus: PaymentStatus.Paid })
            {
                order.Payment.PaymentStatus = PaymentStatus.Refunded;   // mock refund; no real gateway call here
                order.PaymentStatus = PaymentStatus.Refunded;
            }

            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch { await tx.RollbackAsync(); throw; }

        return await GetByIdAsync(userId, orderId);
    }

    private static string GenerateOrderNumber() =>
        $"ART{DateTime.UtcNow:yyMMddHHmmss}{Random.Shared.Next(100, 999)}";

    private static string FormatAddress(Address a) =>
        $"{a.FullName}, {a.AddressLine1}" +
        (string.IsNullOrWhiteSpace(a.AddressLine2) ? "" : $", {a.AddressLine2}") +
        $", {a.City}, {a.State} {a.PostalCode}, {a.Country} · {a.PhoneNumber}";
}