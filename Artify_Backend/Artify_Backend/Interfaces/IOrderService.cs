using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IOrderService
{
    Task<OrderDetailDto> CreateAsync(int userId, CreateOrderDto dto);
    Task<PagedResult<OrderListDto>> GetListAsync(int userId, OrderQuery query);
    Task<OrderDetailDto> GetByIdAsync(int userId, int orderId);
    Task<OrderDetailDto> CancelAsync(int userId, int orderId);
}