using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Helpers;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Artify.API.Services;

public class PrintPricingService(ApplicationDbContext db, IOptions<PrintSettings> options) : IPrintPricingService
{
    private readonly PrintSettings _s = options.Value;

    public string? Validate(decimal width, decimal height, int quantity)
    {
        if (width <= 0 || height <= 0) return "Width and height must be greater than 0";
        if (width < _s.MinSide || width > _s.MaxSide || height < _s.MinSide || height > _s.MaxSide)
            return $"Each side must be between {_s.MinSide} and {_s.MaxSide} inches";
        if (quantity < 1 || quantity > CartRules.MaxQuantityPerItem)
            return $"Quantity must be between 1 and {CartRules.MaxQuantityPerItem}";
        return null;
    }

    // ---- THE formula. Change pricing rules here and nowhere else. ----
    //   Area         = Width x Height
    //   Base cost    = flat printing cost
    //   Size cost    = Area x size rate
    //   Material     = Area x material.PricePerSquareUnit
    //   Frame        = frame.AdditionalPrice
    //   Unit price   = Base + Size + Material + Frame        Total = Unit price x Quantity
    public PrintPriceDto Calculate(decimal width, decimal height, PrintMaterial material, Frame frame, int quantity)
    {
        var problem = Validate(width, height, quantity)
            ?? (!material.IsActive ? $"{material.Name} is not available" : null)
            ?? (!frame.IsActive ? $"{frame.Name} frame is not available" : null);
        if (problem is not null) throw new InvalidOperationException(problem);

        var area = Round(width * height);
        var baseCost = Round(_s.BasePrintingCost);
        var sizeCost = Round(area * _s.SizeCostPerSquareUnit);
        var materialCost = Round(area * material.PricePerSquareUnit);
        var frameCost = Round(frame.AdditionalPrice);
        var unit = baseCost + sizeCost + materialCost + frameCost;

        return new PrintPriceDto
        {
            Width = width,
            Height = height,
            Area = area,
            BaseCost = baseCost,
            SizeCost = sizeCost,
            MaterialCost = materialCost,
            FrameCost = frameCost,
            UnitPrice = unit,
            Quantity = quantity,
            Total = unit * quantity
        };
    }

    public async Task<PrintPriceDto> CalculateAsync(PrintPriceRequestDto r)
    {
        var material = await db.PrintMaterials.AsNoTracking().FirstOrDefaultAsync(m => m.MaterialId == r.MaterialId)
            ?? throw new InvalidOperationException("Selected material does not exist");
        var frame = await db.Frames.AsNoTracking().FirstOrDefaultAsync(f => f.FrameId == r.FrameId)
            ?? throw new InvalidOperationException("Selected frame does not exist");
        return Calculate(r.Width, r.Height, material, frame, r.Quantity);
    }

    public (decimal? UnitPrice, string? Issue) EvaluateCartItem(CartItem i)
    {
        if (i.Material is null || i.Frame is null || i.CustomWidth is null || i.CustomHeight is null)
            return (null, "This print is no longer available");
        if (!i.Material.IsActive) return (null, $"{i.Material.Name} is no longer available");
        if (!i.Frame.IsActive) return (null, $"{i.Frame.Name} frame is no longer available");

        var problem = Validate(i.CustomWidth.Value, i.CustomHeight.Value, i.Quantity);
        if (problem is not null) return (null, problem);

        return (Calculate(i.CustomWidth.Value, i.CustomHeight.Value, i.Material, i.Frame, i.Quantity).UnitPrice, null);
    }

    private static decimal Round(decimal v) => Math.Round(v, 2, MidpointRounding.AwayFromZero);
}