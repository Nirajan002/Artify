using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/reviews/{id:int}")]
public class AdminReviewsController(IReviewService reviews) : ControllerBase
{
    [HttpDelete]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await reviews.AdminDeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(null!, "Review removed"));
    }
}