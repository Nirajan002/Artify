// Interfaces/IAuthService.cs
using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<UserDto> GetCurrentUserAsync(int userId);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
}