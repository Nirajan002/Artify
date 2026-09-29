using Artify.API.DTOs;
namespace Artify.API.Interfaces;

public interface IMaterialService
{
    Task<List<MaterialAdminDto>> GetAllAsync();
    Task<MaterialAdminDto> CreateAsync(SaveMaterialDto dto);
    Task<MaterialAdminDto> UpdateAsync(int id, SaveMaterialDto dto);
    Task DeactivateAsync(int id);
}

public interface IFrameService
{
    Task<List<FrameAdminDto>> GetAllAsync();
    Task<FrameAdminDto> CreateAsync(SaveFrameDto dto);
    Task<FrameAdminDto> UpdateAsync(int id, SaveFrameDto dto);
    Task DeactivateAsync(int id);
}