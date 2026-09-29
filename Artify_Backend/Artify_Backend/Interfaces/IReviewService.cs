using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IReviewService
{
    Task<ReviewSummaryDto> GetForArtworkAsync(int artworkId, int? viewerUserId);
    Task<ReviewEligibilityDto> GetEligibilityAsync(int userId, int artworkId);
    Task<ReviewDto> CreateAsync(int userId, int artworkId, SaveReviewDto dto);
    Task<ReviewDto> UpdateAsync(int userId, int reviewId, SaveReviewDto dto);
    Task DeleteOwnAsync(int userId, int reviewId);
    Task AdminDeleteAsync(int reviewId);
}