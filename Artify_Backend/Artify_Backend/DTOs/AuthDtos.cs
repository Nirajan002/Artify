namespace Artify.API.DTOs;

public record RegisterDto(string FirstName, string LastName, string Email, string Password, string? PhoneNumber);
public record LoginDto(string Email, string Password);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
public record UserDto(int UserId, string FirstName, string LastName, string Email, string? PhoneNumber, string Role);
public record AuthResponseDto(string Token, DateTime ExpiresAt, UserDto User);

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public T? Data { get; set; }
    public Dictionary<string, string[]>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "OK") => new() { Success = true, Message = message, Data = data };
    public static ApiResponse<T> Fail(string message) => new() { Success = false, Message = message };
}