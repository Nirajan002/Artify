using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
public class ReviewsController(IReviewService reviews) : ApiControllerBase
{
    private int? ViewerId => User.Identity?.IsAuthenticated == true ? UserId : null;

    [HttpGet("api/artworks/{artworkId:int}/reviews")]
    public async Task<ActionResult<ApiResponse<ReviewSummaryDto>>> GetForArtwork(int artworkId)
        => Ok(ApiResponse<ReviewSummaryDto>.Ok(await reviews.GetForArtworkAsync(artworkId, ViewerId)));

    [Authorize, HttpGet("api/artworks/{artworkId:int}/reviews/eligibility")]
    public async Task<ActionResult<ApiResponse<ReviewEligibilityDto>>> GetEligibility(int artworkId)
        => Ok(ApiResponse<ReviewEligibilityDto>.Ok(await reviews.GetEligibilityAsync(UserId, artworkId)));

    [Authorize, HttpPost("api/artworks/{artworkId:int}/reviews")]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> Create(int artworkId, SaveReviewDto dto)
        => Ok(ApiResponse<ReviewDto>.Ok(await reviews.CreateAsync(UserId, artworkId, dto), "Review submitted"));

    [Authorize, HttpPut("api/reviews/{id:int}")]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> Update(int id, SaveReviewDto dto)
        => Ok(ApiResponse<ReviewDto>.Ok(await reviews.UpdateAsync(UserId, id, dto), "Review updated"));

    [Authorize, HttpDelete("api/reviews/{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await reviews.DeleteOwnAsync(UserId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Review deleted"));
    }
}