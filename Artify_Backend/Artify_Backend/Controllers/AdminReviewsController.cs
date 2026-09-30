using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/reviews")]
public class AdminReviewsController(IReviewService reviews) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminReviewDto>>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isApproved = null)
    {
        var result = await reviews.GetAllAdminAsync(page, pageSize, isApproved);
        return Ok(ApiResponse<PagedResult<AdminReviewDto>>.Ok(result));
    }

    [HttpPut("{id:int}/approval")]
    public async Task<ActionResult<ApiResponse<object>>> SetApproval(int id, [FromBody] SetReviewApprovedDto dto)
    {
        await reviews.SetApprovedAsync(id, dto.IsApproved);
        return Ok(ApiResponse<object>.Ok(null!, dto.IsApproved ? "Review approved" : "Review rejected"));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await reviews.AdminDeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(null!, "Review removed"));
    }
}