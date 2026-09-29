using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Artify.API.Controllers;

[ApiController]
[Route("api/custom-print")]
public class CustomPrintController(
    ICustomPrintService custom, IPrintPricingService pricing, IImageStorageService storage) : ControllerBase
{
    [HttpGet("options")]
    public async Task<ActionResult<ApiResponse<PrintOptionsDto>>> Options()
        => Ok(ApiResponse<PrintOptionsDto>.Ok(await custom.GetOptionsAsync()));

    // Public: anyone can get an estimate
    [HttpPost("calculate-price"), EnableRateLimiting("pricing")]
    public async Task<ActionResult<ApiResponse<PrintPriceDto>>> Calculate(PrintPriceRequestDto dto)
        => Ok(ApiResponse<PrintPriceDto>.Ok(await pricing.CalculateAsync(dto)));

    // Uploading requires an account
    [Authorize, HttpPost("upload"), EnableRateLimiting("uploads"), RequestSizeLimit(12_000_000)]
    public async Task<ActionResult<ApiResponse<string>>> Upload(IFormFile file)
        => Ok(ApiResponse<string>.Ok(await storage.SaveAsync(file, "custom-art"), "Image uploaded"));
}