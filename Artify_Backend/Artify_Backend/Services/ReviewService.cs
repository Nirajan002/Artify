using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Helpers;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class ReviewService(ApplicationDbContext db) : IReviewService
{
    // Only orders that actually arrived count as a verified purchase
    private static readonly OrderStatus[] VerifiedStatuses = { OrderStatus.Delivered };

    public async Task<ReviewSummaryDto> GetForArtworkAsync(int artworkId, int? viewerUserId)
    {
        var reviews = await db.Reviews.AsNoTracking()
            .Where(r => r.ArtworkId == artworkId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                UserId = r.UserId,
                ReviewerName = r.User.FirstName + " " + r.User.LastName.Substring(0, 1) + ".",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                IsOwn = viewerUserId != null && r.UserId == viewerUserId
            })
            .ToListAsync();

        var breakdown = Enumerable.Range(1, 5).ToDictionary(n => n, n => reviews.Count(r => r.Rating == n));
        return new ReviewSummaryDto
        {
            AverageRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
            ReviewCount = reviews.Count,
            Breakdown = breakdown,
            Reviews = reviews
        };
    }

    public async Task<ReviewEligibilityDto> GetEligibilityAsync(int userId, int artworkId)
    {
        var existing = await db.Reviews.AsNoTracking()
            .Where(r => r.UserId == userId && r.ArtworkId == artworkId)
            .Select(r => new { r.ReviewId, r.Rating, r.Comment })
            .FirstOrDefaultAsync();

        if (existing is not null)
            return new ReviewEligibilityDto
            {
                CanReview = true,
                AlreadyReviewed = true,
                ExistingReviewId = existing.ReviewId,
                Rating = existing.Rating,
                Comment = existing.Comment
            };

        // Orders that (a) belong to this user, (b) count as delivered, (c) contain this artwork,
        // and (d) have not already been used for a review of this artwork
        var reviewedOrderIds = await db.Reviews.Where(r => r.UserId == userId && r.ArtworkId == artworkId)
            .Select(r => r.OrderId).ToListAsync();

        var eligibleOrders = await db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId && VerifiedStatuses.Contains(o.OrderStatus)
                     && o.Items.Any(i => i.ArtworkId == artworkId)
                     && !reviewedOrderIds.Contains(o.OrderId))
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new PurchasedOrderDto(o.OrderId, o.OrderNumber, o.UpdatedAt ?? o.CreatedAt))
            .ToListAsync();

        return eligibleOrders.Count == 0
            ? new ReviewEligibilityDto { CanReview = false, Reason = "You can review this artwork after your order for it has been delivered." }
            : new ReviewEligibilityDto { CanReview = true, EligibleOrders = eligibleOrders };
    }

    public async Task<ReviewDto> CreateAsync(int userId, int artworkId, SaveReviewDto dto)
    {
        var order = await db.Orders.Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId && o.UserId == userId)
            ?? throw new KeyNotFoundException("Order not found");

        if (!VerifiedStatuses.Contains(order.OrderStatus))
            throw new InvalidOperationException("You can only review artwork from a delivered order");
        if (!order.Items.Any(i => i.ArtworkId == artworkId))
            throw new InvalidOperationException("This order does not include this artwork");

        // One review per purchased artwork/order item — also enforced by the DB's unique index
        if (await db.Reviews.AnyAsync(r => r.UserId == userId && r.ArtworkId == artworkId && r.OrderId == dto.OrderId))
            throw new InvalidOperationException("You have already reviewed this artwork for this order");

        var review = new Review
        {
            UserId = userId,
            ArtworkId = artworkId,
            OrderId = dto.OrderId,
            Rating = dto.Rating,
            Comment = dto.Comment?.Trim(),
            IsApproved = false  // Reviews need admin approval by default
        };
        db.Reviews.Add(review);

        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { throw new InvalidOperationException("You have already reviewed this artwork for this order"); }

        return await ToDtoAsync(review, userId);
    }

    public async Task<ReviewDto> UpdateAsync(int userId, int reviewId, SaveReviewDto dto)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId)
            ?? throw new KeyNotFoundException("Review not found");

        review.Rating = dto.Rating;
        review.Comment = dto.Comment?.Trim();
        review.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await ToDtoAsync(review, userId);
    }

    public async Task DeleteOwnAsync(int userId, int reviewId)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId)
            ?? throw new KeyNotFoundException("Review not found");
        db.Reviews.Remove(review);
        await db.SaveChangesAsync();
    }

    public async Task AdminDeleteAsync(int reviewId)
    {
        var review = await db.Reviews.FindAsync(reviewId) ?? throw new KeyNotFoundException("Review not found");
        db.Reviews.Remove(review);
        await db.SaveChangesAsync();
    }

    public async Task<PagedResult<AdminReviewDto>> GetAllAdminAsync(int page, int pageSize, bool? isApproved)
    {
        var query = db.Reviews.AsNoTracking().AsQueryable();
        
        if (isApproved.HasValue)
            query = query.Where(r => r.IsApproved == isApproved.Value);

        var total = await query.CountAsync();

        var reviews = await query
            .Include(r => r.User)
            .Include(r => r.Artwork)
            .Include(r => r.Order)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReviewDto
            {
                ReviewId = r.ReviewId,
                UserId = r.UserId,
                ReviewerName = r.User.FirstName + " " + r.User.LastName,
                ReviewerEmail = r.User.Email,
                ArtworkId = r.ArtworkId,
                ArtworkTitle = r.Artwork.Title,
                ArtworkImageUrl = r.Artwork.ImageUrl,
                OrderId = r.OrderId,
                OrderNumber = r.Order.OrderNumber,
                Rating = r.Rating,
                Comment = r.Comment,
                IsApproved = r.IsApproved,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return new PagedResult<AdminReviewDto>
        {
            Items = reviews,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task SetApprovedAsync(int reviewId, bool isApproved)
    {
        var review = await db.Reviews.FindAsync(reviewId) ?? throw new KeyNotFoundException("Review not found");
        review.IsApproved = isApproved;
        await db.SaveChangesAsync();
    }

    private async Task<ReviewDto> ToDtoAsync(Review r, int viewerUserId)
    {
        var name = await db.Users.Where(u => u.UserId == r.UserId)
            .Select(u => u.FirstName + " " + u.LastName.Substring(0, 1) + ".")
            .FirstAsync();
        return new ReviewDto
        {
            ReviewId = r.ReviewId,
            UserId = r.UserId,
            ReviewerName = name,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt,
            IsOwn = r.UserId == viewerUserId
        };
    }
}