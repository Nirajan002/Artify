using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Helpers;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Artify.API.Services;

public class CustomPrintService(ApplicationDbContext db, IOptions<PrintSettings> options) : ICustomPrintService
{
    public async Task<PrintOptionsDto> GetOptionsAsync()
    {
        var s = options.Value;
        return new PrintOptionsDto
        {
            Limits = new PrintLimitsDto(s.MinSide, s.MaxSide, "inch"),
            Sizes = s.Sizes.Select(x => new PrintSizeDto(x.Width, x.Height)).ToList(),
            Materials = await db.PrintMaterials.AsNoTracking().Where(m => m.IsActive)
                .OrderBy(m => m.PricePerSquareUnit)
                .Select(m => new MaterialDto(m.MaterialId, m.Name, m.Description, m.PricePerSquareUnit))
                .ToListAsync(),
            Frames = await db.Frames.AsNoTracking().Where(f => f.IsActive)
                .OrderBy(f => f.AdditionalPrice)
                .Select(f => new FrameDto(f.FrameId, f.Name, f.Description, f.AdditionalPrice))
                .ToListAsync()
        };
    }
}