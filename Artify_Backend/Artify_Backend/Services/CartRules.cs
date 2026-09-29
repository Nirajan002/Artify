using Artify.API.Entities;

namespace Artify.API.Services;

public static class CartRules
{
    public const int MaxQuantityPerItem = 10;

    // An original is one-of-a-kind
    public static int MaxQuantityFor(ArtworkVariant v) =>
        v.VariantType == VariantType.Original ? 1 : MaxQuantityPerItem;

    /// Returns why this item can't be purchased right now, or null if it can.
    /// Expects Artwork and ArtworkVariant to be loaded.
    public static string? GetIssue(CartItem i)
    {
        if (i.ItemType != CartItemType.Artwork) return null;   // custom prints are validated in Phase 6

        var a = i.Artwork;
        var v = i.ArtworkVariant;
        if (a is null || v is null || a.Status != ArtworkStatus.Published) return "No longer available";
        if (!v.IsAvailable) return "This version is no longer available";
        if (v.VariantType == VariantType.Original && !a.IsOriginalAvailable) return "The original has been sold";
        if (v.VariantType != VariantType.Original && !a.IsPrintAvailable) return "Prints are not available";
        if (v.StockQuantity < 1) return "Out of stock";
        if (v.StockQuantity < i.Quantity) return $"Only {v.StockQuantity} left in stock";
        return null;
    }
}