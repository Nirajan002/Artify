using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public class AdminDashboardController(IDashboardService dashboard) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> Stats()
        => Ok(ApiResponse<DashboardStatsDto>.Ok(await dashboard.GetStatsAsync()));

    [HttpGet("charts")]
    public async Task<ActionResult<ApiResponse<DashboardChartsDto>>> Charts()
        => Ok(ApiResponse<DashboardChartsDto>.Ok(await dashboard.GetChartsAsync()));
}