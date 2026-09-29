using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
public class AdminCatalogController(IMaterialService materials, IFrameService frames) : ControllerBase
{
    [HttpGet("api/admin/materials")]
    public async Task<ActionResult<ApiResponse<List<MaterialAdminDto>>>> GetMaterials()
        => Ok(ApiResponse<List<MaterialAdminDto>>.Ok(await materials.GetAllAsync()));

    [HttpPost("api/admin/materials")]
    public async Task<ActionResult<ApiResponse<MaterialAdminDto>>> CreateMaterial(SaveMaterialDto dto)
        => Ok(ApiResponse<MaterialAdminDto>.Ok(await materials.CreateAsync(dto), "Material created"));

    [HttpPut("api/admin/materials/{id:int}")]
    public async Task<ActionResult<ApiResponse<MaterialAdminDto>>> UpdateMaterial(int id, SaveMaterialDto dto)
        => Ok(ApiResponse<MaterialAdminDto>.Ok(await materials.UpdateAsync(id, dto), "Material updated"));

    [HttpDelete("api/admin/materials/{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteMaterial(int id)
    {
        await materials.DeactivateAsync(id);
        return Ok(ApiResponse<object>.Ok(null!, "Material deactivated"));
    }

    [HttpGet("api/admin/frames")]
    public async Task<ActionResult<ApiResponse<List<FrameAdminDto>>>> GetFrames()
        => Ok(ApiResponse<List<FrameAdminDto>>.Ok(await frames.GetAllAsync()));

    [HttpPost("api/admin/frames")]
    public async Task<ActionResult<ApiResponse<FrameAdminDto>>> CreateFrame(SaveFrameDto dto)
        => Ok(ApiResponse<FrameAdminDto>.Ok(await frames.CreateAsync(dto), "Frame created"));

    [HttpPut("api/admin/frames/{id:int}")]
    public async Task<ActionResult<ApiResponse<FrameAdminDto>>> UpdateFrame(int id, SaveFrameDto dto)
        => Ok(ApiResponse<FrameAdminDto>.Ok(await frames.UpdateAsync(id, dto), "Frame updated"));

    [HttpDelete("api/admin/frames/{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteFrame(int id)
    {
        await frames.DeactivateAsync(id);
        return Ok(ApiResponse<object>.Ok(null!, "Frame deactivated"));
    }
}