using Artify.API.DTOs;
using Artify.API.Helpers;
namespace Artify.API.Interfaces;

public interface IReviewService
{
    Task<ReviewSummaryDto> GetForArtworkAsync(int artworkId, int? viewerUserId);
    Task<ReviewEligibilityDto> GetEligibilityAsync(int userId, int artworkId);
    Task<ReviewDto> CreateAsync(int userId, int artworkId, SaveReviewDto dto);
    Task<ReviewDto> UpdateAsync(int userId, int reviewId, SaveReviewDto dto);
    Task DeleteOwnAsync(int userId, int reviewId);
    Task<PagedResult<AdminReviewDto>> GetAllAdminAsync(int page, int pageSize, bool? isApproved);
    Task SetApprovedAsync(int reviewId, bool isApproved);
    Task AdminDeleteAsync(int reviewId);
}