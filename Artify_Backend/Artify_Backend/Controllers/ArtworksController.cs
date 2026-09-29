using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Route("api/artworks")]
public class ArtworksController(IArtworkService artworks) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ArtworkListDto>>>> Get([FromQuery] ArtworkQuery query)
        => Ok(ApiResponse<PagedResult<ArtworkListDto>>.Ok(await artworks.GetListAsync(query, publicOnly: true)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ArtworkDetailDto>>> GetById(int id)
        => Ok(ApiResponse<ArtworkDetailDto>.Ok(await artworks.GetByIdAsync(id, publicOnly: true)));

    [HttpGet("/api/home")]
    public async Task<ActionResult<ApiResponse<HomeDataDto>>> Home()
    => Ok(ApiResponse<HomeDataDto>.Ok(await artworks.GetHomeDataAsync()));
}