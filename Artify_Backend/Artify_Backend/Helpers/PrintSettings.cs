namespace Artify.API.Helpers;

public class PrintSize
{
    public decimal Width { get; set; }
    public decimal Height { get; set; }
}

public class PrintSettings
{
    public decimal MinSide { get; set; } = 4;                    // inches
    public decimal MaxSide { get; set; } = 60;
    public decimal BasePrintingCost { get; set; } = 150;         // flat cost per print
    public decimal SizeCostPerSquareUnit { get; set; } = 0.5m;   // handling/ink per square inch
    public List<PrintSize> Sizes { get; set; } = new();          // filled from appsettings only
}