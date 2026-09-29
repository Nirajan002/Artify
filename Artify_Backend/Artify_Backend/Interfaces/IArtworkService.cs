using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IArtworkService
{
    Task<PagedResult<ArtworkListDto>> GetListAsync(ArtworkQuery query, bool publicOnly);
    Task<ArtworkDetailDto> GetByIdAsync(int id, bool publicOnly);
    Task<ArtworkDetailDto> CreateAsync(SaveArtworkDto dto);
    Task<ArtworkDetailDto> UpdateAsync(int id, SaveArtworkDto dto);
    Task ArchiveAsync(int id);
    Task<HomeDataDto> GetHomeDataAsync();
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto> CreateAsync(SaveCategoryDto dto);
    Task<CategoryDto> UpdateAsync(int id, SaveCategoryDto dto);
    Task DeleteAsync(int id);
}