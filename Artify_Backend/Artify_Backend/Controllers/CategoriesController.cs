using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
public class CategoriesController(ICategoryService categories) : ControllerBase
{
    [HttpGet("api/categories")]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
        => Ok(ApiResponse<List<CategoryDto>>.Ok(await categories.GetAllAsync()));

    [Authorize(Roles = "Admin"), HttpPost("api/admin/categories")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create(SaveCategoryDto dto)
        => Ok(ApiResponse<CategoryDto>.Ok(await categories.CreateAsync(dto), "Category created"));

    [Authorize(Roles = "Admin"), HttpPut("api/admin/categories/{id:int}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(int id, SaveCategoryDto dto)
        => Ok(ApiResponse<CategoryDto>.Ok(await categories.UpdateAsync(id, dto), "Category updated"));

    [Authorize(Roles = "Admin"), HttpDelete("api/admin/categories/{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await categories.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(null!, "Category deleted"));
    }
}