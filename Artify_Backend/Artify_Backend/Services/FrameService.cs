using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class FrameService(ApplicationDbContext db) : IFrameService
{
    public Task<List<FrameAdminDto>> GetAllAsync() =>
        db.Frames.AsNoTracking().OrderBy(f => f.Name)
            .Select(f => new FrameAdminDto { FrameId = f.FrameId, Name = f.Name, Description = f.Description, AdditionalPrice = f.AdditionalPrice, IsActive = f.IsActive })
            .ToListAsync();

    public async Task<FrameAdminDto> CreateAsync(SaveFrameDto dto)
    {
        var f = new Frame { Name = dto.Name.Trim(), Description = dto.Description?.Trim(), AdditionalPrice = dto.AdditionalPrice, IsActive = dto.IsActive };
        db.Frames.Add(f);
        await db.SaveChangesAsync();
        return new FrameAdminDto { FrameId = f.FrameId, Name = f.Name, Description = f.Description, AdditionalPrice = f.AdditionalPrice, IsActive = f.IsActive };
    }

    public async Task<FrameAdminDto> UpdateAsync(int id, SaveFrameDto dto)
    {
        var f = await db.Frames.FindAsync(id) ?? throw new KeyNotFoundException("Frame not found");
        f.Name = dto.Name.Trim(); f.Description = dto.Description?.Trim();
        f.AdditionalPrice = dto.AdditionalPrice; f.IsActive = dto.IsActive;
        await db.SaveChangesAsync();
        return new FrameAdminDto { FrameId = f.FrameId, Name = f.Name, Description = f.Description, AdditionalPrice = f.AdditionalPrice, IsActive = f.IsActive };
    }

    public async Task DeactivateAsync(int id)
    {
        var f = await db.Frames.FindAsync(id) ?? throw new KeyNotFoundException("Frame not found");
        f.IsActive = false;
        await db.SaveChangesAsync();
    }
}