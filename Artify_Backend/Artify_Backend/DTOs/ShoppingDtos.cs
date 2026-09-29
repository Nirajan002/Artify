using Artify.API.Entities;

namespace Artify.API.DTOs;

// ---------- Cart ----------
public class AddCartItemDto
{
    public CartItemType ItemType { get; set; } = CartItemType.Artwork;
    public int? ArtworkVariantId { get; set; }   // the artwork is derived from the variant server-side
    public int Quantity { get; set; } = 1;

    // Custom print fields (used from Phase 6)
    public string? CustomArtworkUrl { get; set; }
    public decimal? CustomWidth { get; set; }
    public decimal? CustomHeight { get; set; }
    public int? MaterialId { get; set; }
    public int? FrameId { get; set; }
}

public class UpdateCartItemDto { public int Quantity { get; set; } }

public class CartItemDto
{
    public int CartItemId { get; set; }
    public CartItemType ItemType { get; set; }
    public int? ArtworkId { get; set; }
    public int? ArtworkVariantId { get; set; }
    public VariantType? VariantType { get; set; }
    public string Title { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string? Issue { get; set; }           // e.g. "Out of stock"; null when the item is fine
    public decimal? CustomWidth { get; set; }
    public decimal? CustomHeight { get; set; }
    public string? MaterialName { get; set; }
    public string? FrameName { get; set; }
}

public class CartDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public int ItemCount { get; set; }
    public decimal Subtotal { get; set; }        // only items without issues
    public bool HasIssues { get; set; }
}

// ---------- Address ----------
public class SaveAddressDto
{
    public string FullName { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string AddressLine1 { get; set; } = "";
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string Country { get; set; } = "Nepal";
    public bool IsDefault { get; set; }
}

public class AddressDto : SaveAddressDto { public int AddressId { get; set; } }