using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(IAdminUserService users) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminUserDto>>>> Get([FromQuery] UserQuery query)
        => Ok(ApiResponse<PagedResult<AdminUserDto>>.Ok(await users.GetListAsync(query)));

    [HttpPut("{id:int}/active")]
    public async Task<ActionResult<ApiResponse<object>>> SetActive(int id, [FromBody] bool isActive)
    {
        await users.SetActiveAsync(UserId, id, isActive);
        return Ok(ApiResponse<object>.Ok(null!, isActive ? "User activated" : "User deactivated"));
    }
}