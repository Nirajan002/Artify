using Artify.API.Entities;

namespace Artify.API.DTOs;

public class CreateOrderDto
{
    public int AddressId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
}

public class OrderQuery
{
    public OrderStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class OrderItemDto
{
    public int OrderItemId { get; set; }
    public CartItemType ItemType { get; set; }
    public int? ArtworkId { get; set; }
    public string Title { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public VariantType? VariantType { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal? CustomWidth { get; set; }
    public decimal? CustomHeight { get; set; }
    public string? MaterialName { get; set; }
    public string? FrameName { get; set; }
}

public class OrderListDto
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public OrderStatus OrderStatus { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public int ItemCount { get; set; }
    public string ThumbnailUrl { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class OrderDetailDto : OrderListDto
{
    public string ShippingAddress { get; set; } = "";
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Discount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public List<string> StatusFlow { get; set; } = new();   // the ordered stages this order goes through
    public bool CanCancel { get; set; }
}