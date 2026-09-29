using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[Authorize]
[Route("api/orders")]
public class OrdersController(IOrderService orders) : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> Create(CreateOrderDto dto)
        => Ok(ApiResponse<OrderDetailDto>.Ok(await orders.CreateAsync(UserId, dto), "Order placed"));

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderListDto>>>> Get([FromQuery] OrderQuery query)
        => Ok(ApiResponse<PagedResult<OrderListDto>>.Ok(await orders.GetListAsync(UserId, query)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> GetById(int id)
        => Ok(ApiResponse<OrderDetailDto>.Ok(await orders.GetByIdAsync(UserId, id)));

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> Cancel(int id)
        => Ok(ApiResponse<OrderDetailDto>.Ok(await orders.CancelAsync(UserId, id), "Order cancelled"));
}