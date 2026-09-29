using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IAdminOrderService
{
    Task<PagedResult<AdminOrderListDto>> GetListAsync(AdminOrderQuery query);
    Task<OrderDetailDto> AdvanceStatusAsync(int orderId, AdvanceOrderStatusDto dto);
}