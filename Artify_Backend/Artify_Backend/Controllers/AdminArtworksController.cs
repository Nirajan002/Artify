using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/artworks")]
public class AdminArtworksController(IArtworkService artworks, IImageStorageService storage) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ArtworkListDto>>>> Get([FromQuery] ArtworkQuery query)
        => Ok(ApiResponse<PagedResult<ArtworkListDto>>.Ok(await artworks.GetListAsync(query, publicOnly: false)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ArtworkDetailDto>>> GetById(int id)
        => Ok(ApiResponse<ArtworkDetailDto>.Ok(await artworks.GetByIdAsync(id, publicOnly: false)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ArtworkDetailDto>>> Create(SaveArtworkDto dto)
        => Ok(ApiResponse<ArtworkDetailDto>.Ok(await artworks.CreateAsync(dto), "Artwork created"));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ArtworkDetailDto>>> Update(int id, SaveArtworkDto dto)
        => Ok(ApiResponse<ArtworkDetailDto>.Ok(await artworks.UpdateAsync(id, dto), "Artwork updated"));

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await artworks.ArchiveAsync(id);
        return Ok(ApiResponse<object>.Ok(null!, "Artwork archived"));
    }

    [HttpPost("upload"), RequestSizeLimit(12_000_000)]
    public async Task<ActionResult<ApiResponse<string>>> Upload(IFormFile file)
        => Ok(ApiResponse<string>.Ok(await storage.SaveAsync(file, "artworks")));
}