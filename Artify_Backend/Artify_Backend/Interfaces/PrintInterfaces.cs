using Artify.API.DTOs;
using Artify.API.Entities;

namespace Artify.API.Interfaces;

public interface IPrintPricingService
{
    /// Returns a message if the size or quantity is not allowed, otherwise null.
    string? Validate(decimal width, decimal height, int quantity);

    /// Pure calculation. Throws InvalidOperationException if anything is invalid or inactive.
    PrintPriceDto Calculate(decimal width, decimal height, PrintMaterial material, Frame frame, int quantity);

    /// Loads the material and frame from the database, then calculates.
    Task<PrintPriceDto> CalculateAsync(PrintPriceRequestDto request);

    /// For cart and checkout: the current unit price of a custom-print cart item, or why it can't be bought.
    /// Material and Frame must be loaded on the item.
    (decimal? UnitPrice, string? Issue) EvaluateCartItem(CartItem item);
}

public interface ICustomPrintService
{
    Task<PrintOptionsDto> GetOptionsAsync();
}