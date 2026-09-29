using System.Security.Claims;
using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Artify.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(RegisterDto dto)
        => Ok(ApiResponse<AuthResponseDto>.Ok(await auth.RegisterAsync(dto), "Registered"));

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(LoginDto dto)
        => Ok(ApiResponse<AuthResponseDto>.Ok(await auth.LoginAsync(dto), "Logged in"));

    [Authorize, HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Me()
        => Ok(ApiResponse<UserDto>.Ok(await auth.GetCurrentUserAsync(UserId)));

    [Authorize, HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword(ChangePasswordDto dto)
    {
        await auth.ChangePasswordAsync(UserId, dto);
        return Ok(ApiResponse<object>.Ok(null!, "Password changed"));
    }
}