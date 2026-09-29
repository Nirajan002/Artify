using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class MaterialService(ApplicationDbContext db) : IMaterialService
{
    public Task<List<MaterialAdminDto>> GetAllAsync() =>
        db.PrintMaterials.AsNoTracking().OrderBy(m => m.Name)
            .Select(m => new MaterialAdminDto { MaterialId = m.MaterialId, Name = m.Name, Description = m.Description, PricePerSquareUnit = m.PricePerSquareUnit, IsActive = m.IsActive })
            .ToListAsync();

    public async Task<MaterialAdminDto> CreateAsync(SaveMaterialDto dto)
    {
        var m = new PrintMaterial { Name = dto.Name.Trim(), Description = dto.Description?.Trim(), PricePerSquareUnit = dto.PricePerSquareUnit, IsActive = dto.IsActive };
        db.PrintMaterials.Add(m);
        await db.SaveChangesAsync();
        return new MaterialAdminDto { MaterialId = m.MaterialId, Name = m.Name, Description = m.Description, PricePerSquareUnit = m.PricePerSquareUnit, IsActive = m.IsActive };
    }

    public async Task<MaterialAdminDto> UpdateAsync(int id, SaveMaterialDto dto)
    {
        var m = await db.PrintMaterials.FindAsync(id) ?? throw new KeyNotFoundException("Material not found");
        m.Name = dto.Name.Trim(); m.Description = dto.Description?.Trim();
        m.PricePerSquareUnit = dto.PricePerSquareUnit; m.IsActive = dto.IsActive;
        await db.SaveChangesAsync();
        return new MaterialAdminDto { MaterialId = m.MaterialId, Name = m.Name, Description = m.Description, PricePerSquareUnit = m.PricePerSquareUnit, IsActive = m.IsActive };
    }

    // Soft-disable only: existing cart items and order history reference this row
    public async Task DeactivateAsync(int id)
    {
        var m = await db.PrintMaterials.FindAsync(id) ?? throw new KeyNotFoundException("Material not found");
        m.IsActive = false;
        await db.SaveChangesAsync();
    }
}