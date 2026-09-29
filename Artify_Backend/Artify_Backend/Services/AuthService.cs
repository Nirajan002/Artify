using Artify.API.Authentication;
using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class AuthService(ApplicationDbContext db, IJwtTokenService jwt) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
            throw new InvalidOperationException("Email is already registered");

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = email,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Customer // always Customer; never from client
        };
        user.Cart = new Cart();
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Build(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");
        return Build(user);
    }

    public async Task<UserDto> GetCurrentUserAsync(int userId)
    {
        var user = await db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found");
        return ToDto(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found");
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    private AuthResponseDto Build(User u)
    {
        var (token, exp) = jwt.Create(u);
        return new AuthResponseDto(token, exp, ToDto(u));
    }

    private static UserDto ToDto(User u) =>
        new(u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.Role.ToString());
}