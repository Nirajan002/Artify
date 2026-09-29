using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IAdminUserService
{
    Task<PagedResult<AdminUserDto>> GetListAsync(UserQuery query);
    Task SetActiveAsync(int adminId, int userId, bool isActive);
}