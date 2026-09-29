using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class AdminUserService(ApplicationDbContext db) : IAdminUserService
{
    public async Task<PagedResult<AdminUserDto>> GetListAsync(UserQuery q)
    {
        var page = Math.Max(q.Page, 1);
        var size = Math.Clamp(q.PageSize, 1, 50);

        var src = db.Users.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim();
            src = src.Where(u => u.FirstName.Contains(s) || u.LastName.Contains(s) || u.Email.Contains(s));
        }
        if (!string.IsNullOrWhiteSpace(q.Role) && Enum.TryParse<Entities.UserRole>(q.Role, out var role))
            src = src.Where(u => u.Role == role);

        var total = await src.CountAsync();
        var items = await src.OrderByDescending(u => u.CreatedAt).Skip((page - 1) * size).Take(size)
            .Select(u => new AdminUserDto
            {
                UserId = u.UserId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                OrderCount = u.Orders.Count,
                CreatedAt = u.CreatedAt
            }).ToListAsync();

        return new PagedResult<AdminUserDto> { Items = items, Page = page, PageSize = size, TotalCount = total };
    }

    public async Task SetActiveAsync(int adminId, int userId, bool isActive)
    {
        if (adminId == userId && !isActive) throw new InvalidOperationException("You cannot deactivate your own account");

        var user = await db.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found");
        if (user.Role == Entities.UserRole.Admin && !isActive)
            throw new InvalidOperationException("Admin accounts cannot be deactivated here");

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}