namespace Artify.API.DTOs;

public class PrintPriceRequestDto
{
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public int MaterialId { get; set; }
    public int FrameId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class PrintPriceDto
{
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public decimal Area { get; set; }
    public decimal BaseCost { get; set; }
    public decimal SizeCost { get; set; }
    public decimal MaterialCost { get; set; }
    public decimal FrameCost { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
}

public record PrintLimitsDto(decimal MinSide, decimal MaxSide, string Unit);
public record PrintSizeDto(decimal Width, decimal Height);
public record MaterialDto(int MaterialId, string Name, string? Description, decimal PricePerSquareUnit);
public record FrameDto(int FrameId, string Name, string? Description, decimal AdditionalPrice);

public class PrintOptionsDto
{
    public PrintLimitsDto Limits { get; set; } = null!;
    public List<PrintSizeDto> Sizes { get; set; } = new();
    public List<MaterialDto> Materials { get; set; } = new();
    public List<FrameDto> Frames { get; set; } = new();
}