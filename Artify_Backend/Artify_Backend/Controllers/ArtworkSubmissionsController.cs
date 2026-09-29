using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Artify.API.Controllers;

[ApiController]
[Route("api/artwork-submissions")]
[EnableRateLimiting("submissions")]   // anonymous endpoints must be rate limited
public class ArtworkSubmissionsController(ISubmissionService submissions, IImageStorageService storage) : ControllerBase
{
    [HttpPost("upload"), RequestSizeLimit(12_000_000)]
    public async Task<ActionResult<ApiResponse<string>>> Upload(IFormFile file)
        => Ok(ApiResponse<string>.Ok(await storage.SaveAsync(file, "submissions"), "Image uploaded"));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SubmissionCreatedDto>>> Create(CreateSubmissionDto dto)
        => Ok(ApiResponse<SubmissionCreatedDto>.Ok(await submissions.CreateAsync(dto),
            "Submission received. Our team will review it."));
}