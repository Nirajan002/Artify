namespace Artify.API.DTOs;

public class SaveReviewDto
{
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public string ReviewerName { get; set; } = "";
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsOwn { get; set; }         // lets the frontend show Edit/Delete without a second lookup
}

public class ReviewSummaryDto
{
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public Dictionary<int, int> Breakdown { get; set; } = new();   // 1..5 -> count
    public List<ReviewDto> Reviews { get; set; } = new();
}

// What this user is allowed to do on this artwork, so the frontend shows the right form state
public class ReviewEligibilityDto
{
    public bool CanReview { get; set; }
    public bool AlreadyReviewed { get; set; }
    public int? ExistingReviewId { get; set; }
    public int? Rating { get; set; }
    public string? Comment { get; set; }
    public string? Reason { get; set; }     // why CanReview is false, e.g. "Purchase an order first"
    public List<PurchasedOrderDto> EligibleOrders { get; set; } = new();
}

public record PurchasedOrderDto(int OrderId, string OrderNumber, DateTime DeliveredOrPlacedAt);