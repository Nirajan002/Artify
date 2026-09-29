using System.Security.Claims;
using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/artwork-submissions")]
public class AdminSubmissionsController(ISubmissionService submissions) : ControllerBase
{
    private int AdminId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<SubmissionListDto>>>> Get([FromQuery] SubmissionQuery query)
        => Ok(ApiResponse<PagedResult<SubmissionListDto>>.Ok(await submissions.GetListAsync(query)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<SubmissionDetailDto>>> GetById(int id)
        => Ok(ApiResponse<SubmissionDetailDto>.Ok(await submissions.GetByIdAsync(id)));

    [HttpPut("{id:int}/approve")]
    public async Task<ActionResult<ApiResponse<SubmissionDetailDto>>> Approve(int id, ApproveSubmissionDto? dto)
        => Ok(ApiResponse<SubmissionDetailDto>.Ok(
            await submissions.ApproveAsync(id, AdminId, dto?.Comment), "Submission approved and artwork published"));

    [HttpPut("{id:int}/reject")]
    public async Task<ActionResult<ApiResponse<SubmissionDetailDto>>> Reject(int id, RejectSubmissionDto dto)
        => Ok(ApiResponse<SubmissionDetailDto>.Ok(
            await submissions.RejectAsync(id, AdminId, dto.Reason), "Submission rejected"));
}