using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface ICartService
{
    Task<CartDto> GetAsync(int userId);
    Task<CartDto> AddItemAsync(int userId, AddCartItemDto dto);
    Task<CartDto> UpdateQuantityAsync(int userId, int itemId, int quantity);
    Task<CartDto> RemoveItemAsync(int userId, int itemId);
    Task<CartDto> ClearAsync(int userId);
}

public interface IWishlistService
{
    Task<List<ArtworkListDto>> GetAsync(int userId);
    Task AddAsync(int userId, int artworkId);
    Task RemoveAsync(int userId, int artworkId);
}

public interface IAddressService
{
    Task<List<AddressDto>> GetAllAsync(int userId);
    Task<AddressDto> CreateAsync(int userId, SaveAddressDto dto);
    Task<AddressDto> UpdateAsync(int userId, int id, SaveAddressDto dto);
    Task SetDefaultAsync(int userId, int id);
    Task DeleteAsync(int userId, int id);
}