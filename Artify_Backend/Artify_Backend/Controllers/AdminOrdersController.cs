using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrdersController(IAdminOrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminOrderListDto>>>> Get([FromQuery] AdminOrderQuery query)
        => Ok(ApiResponse<PagedResult<AdminOrderListDto>>.Ok(await orders.GetListAsync(query)));

    [HttpPut("{id:int}/advance")]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> Advance(int id, AdvanceOrderStatusDto dto)
        => Ok(ApiResponse<OrderDetailDto>.Ok(await orders.AdvanceStatusAsync(id, dto), "Order status updated"));
}