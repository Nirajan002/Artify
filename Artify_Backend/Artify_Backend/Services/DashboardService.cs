using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class DashboardService(ApplicationDbContext db) : IDashboardService
{
    // Revenue counts orders that were actually paid or are awaiting COD collection — not cancelled ones
    private static readonly OrderStatus[] RevenueStatuses =
        { OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Printing, OrderStatus.Framing, OrderStatus.Shipped, OrderStatus.Delivered };

    public async Task<DashboardStatsDto> GetStatsAsync() => new()
    {
        TotalUsers = await db.Users.CountAsync(u => u.Role == UserRole.Customer),
        TotalArtworks = await db.Artworks.CountAsync(a => a.Status == ArtworkStatus.Published),
        TotalOrders = await db.Orders.CountAsync(),
        TotalRevenue = await db.Orders.Where(o => RevenueStatuses.Contains(o.OrderStatus)).SumAsync(o => (decimal?)o.TotalAmount) ?? 0,
        PendingSubmissions = await db.ArtworkSubmissions.CountAsync(s => s.Status == SubmissionStatus.Pending),
        PendingOrders = await db.Orders.CountAsync(o => o.OrderStatus == OrderStatus.Pending),
        CustomPrintOrders = await db.Orders.CountAsync(o => o.Items.Any(i => i.ItemType == CartItemType.CustomPrint))
    };

    public async Task<DashboardChartsDto> GetChartsAsync()
    {
        var since = DateTime.UtcNow.AddMonths(-5).Date;
        since = new DateTime(since.Year, since.Month, 1);

        var monthlyRaw = await db.Orders
            .Where(o => RevenueStatuses.Contains(o.OrderStatus) && o.CreatedAt >= since)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(o => o.TotalAmount), Orders = g.Count() })
            .ToListAsync();

        // Fill in months with zero orders so the chart has a continuous 6-month axis
        var monthly = Enumerable.Range(0, 6).Select(i =>
        {
            var d = since.AddMonths(i);
            var m = monthlyRaw.FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month);
            return new MonthlyPointDto(d.ToString("MMM yyyy"), m?.Revenue ?? 0, m?.Orders ?? 0);
        }).ToList();

        var topSellers = await db.OrderItems
            .Where(i => i.ArtworkId != null && RevenueStatuses.Contains(i.Order.OrderStatus))
            .GroupBy(i => i.ArtworkId!.Value)
            .Select(g => new
            {
                ArtworkId = g.Key,
                UnitsSold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.TotalPrice)
            })
            .OrderByDescending(x => x.UnitsSold)
            .Take(5)
            .ToListAsync();

        var ids = topSellers.Select(x => x.ArtworkId).ToList();
        var artworkInfo = await db.Artworks.AsNoTracking()
            .Where(a => ids.Contains(a.ArtworkId))
            .Select(a => new { a.ArtworkId, a.Title, Image = a.ThumbnailUrl ?? a.ImageUrl })
            .ToDictionaryAsync(a => a.ArtworkId);

        var popularArtworks = topSellers
            .Where(x => artworkInfo.ContainsKey(x.ArtworkId))
            .Select(x => new PopularArtworkDto(
                x.ArtworkId,
                artworkInfo[x.ArtworkId].Title,
                artworkInfo[x.ArtworkId].Image,
                x.UnitsSold,
                x.Revenue))
            .ToList();

        var salesByCategoryRaw = await db.OrderItems
            .Where(i => i.ArtworkId != null && RevenueStatuses.Contains(i.Order.OrderStatus))
            .Join(db.Artworks,
                  i => i.ArtworkId!.Value,
                  a => a.ArtworkId,
                  (i, a) => new { CategoryName = a.Category.Name, i.TotalPrice, i.Quantity })
            .GroupBy(x => x.CategoryName)
            .Select(g => new
            {
                Category = g.Key,
                Revenue = g.Sum(x => x.TotalPrice),
                UnitsSold = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync();

                var salesByCategory = salesByCategoryRaw
                    .Select(x => new CategorySalesDto(x.Category, x.Revenue, x.UnitsSold))
                    .ToList();

        return new DashboardChartsDto { Monthly = monthly, PopularArtworks = popularArtworks, SalesByCategory = salesByCategory };
    }
}