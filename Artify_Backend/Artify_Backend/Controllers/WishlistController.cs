using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[Authorize]
[Route("api/wishlist")]
public class WishlistController(IWishlistService wishlist) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ArtworkListDto>>>> Get()
        => Ok(ApiResponse<List<ArtworkListDto>>.Ok(await wishlist.GetAsync(UserId)));

    [HttpPost("{artworkId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Add(int artworkId)
    {
        await wishlist.AddAsync(UserId, artworkId);
        return Ok(ApiResponse<object>.Ok(null!, "Added to wishlist"));
    }

    [HttpDelete("{artworkId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Remove(int artworkId)
    {
        await wishlist.RemoveAsync(UserId, artworkId);
        return Ok(ApiResponse<object>.Ok(null!, "Removed from wishlist"));
    }
}