using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[Authorize]
[Route("api/cart")]
public class CartController(ICartService cart) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<CartDto>>> Get()
        => Ok(ApiResponse<CartDto>.Ok(await cart.GetAsync(UserId)));

    [HttpPost("items")]
    public async Task<ActionResult<ApiResponse<CartDto>>> Add(AddCartItemDto dto)
        => Ok(ApiResponse<CartDto>.Ok(await cart.AddItemAsync(UserId, dto), "Added to cart"));

    [HttpPut("items/{id:int}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> Update(int id, UpdateCartItemDto dto)
        => Ok(ApiResponse<CartDto>.Ok(await cart.UpdateQuantityAsync(UserId, id, dto.Quantity)));

    [HttpDelete("items/{id:int}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> Remove(int id)
        => Ok(ApiResponse<CartDto>.Ok(await cart.RemoveItemAsync(UserId, id), "Item removed"));

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<CartDto>>> Clear()
        => Ok(ApiResponse<CartDto>.Ok(await cart.ClearAsync(UserId), "Cart cleared"));
}