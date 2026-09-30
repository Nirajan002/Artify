namespace Artify.API.Entities;

public class Address
{
    public int AddressId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
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

public class Cart
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem
{
    public int CartItemId { get; set; }
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public CartItemType ItemType { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; } // recalculated server-side

    // Existing artwork
    public int? ArtworkId { get; set; }
    public Artwork? Artwork { get; set; }
    public int? ArtworkVariantId { get; set; }
    public ArtworkVariant? ArtworkVariant { get; set; }

    // Custom print
    public string? CustomArtworkUrl { get; set; }
    public decimal? CustomWidth { get; set; }
    public decimal? CustomHeight { get; set; }
    public int? MaterialId { get; set; }
    public PrintMaterial? Material { get; set; }
    public int? FrameId { get; set; }
    public Frame? Frame { get; set; }
}

public class WishlistItem
{
    public int WishlistItemId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int ArtworkId { get; set; }
    public Artwork Artwork { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Order
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string OrderNumber { get; set; } = "";
    public string ShippingAddress { get; set; } = ""; // snapshot at purchase time
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public string? ItemImageUrl { get; set; }
    public Order Order { get; set; } = null!;
    public CartItemType ItemType { get; set; }
    public int? ArtworkId { get; set; }
    public int? ArtworkVariantId { get; set; }
    public VariantType? VariantType { get; set; }
    public string? ItemTitle { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? CustomArtworkUrl { get; set; }
    public decimal? CustomWidth { get; set; }
    public decimal? CustomHeight { get; set; }
    public int? MaterialId { get; set; }
    public string? MaterialName { get; set; }
    public int? FrameId { get; set; }
    public string? FrameName { get; set; }
}

public class Payment
{
    public int PaymentId { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? TransactionReference { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Review
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int ArtworkId { get; set; }
    public Artwork Artwork { get; set; } = null!;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsApproved { get; set; } = false;
}