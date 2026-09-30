using Artify.API.Entities;

namespace Artify.API.DTOs;

// ---------- Users ----------
public class AdminUserDto
{
    public int UserId { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "";
    public bool IsActive { get; set; }
    public int OrderCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
public class UserQuery { public string? Search { get; set; } public string? Role { get; set; } public int Page { get; set; } = 1; public int PageSize { get; set; } = 15; }
public class SetUserActiveDto { public bool IsActive { get; set; } }

// ---------- Materials / Frames ----------
public class SaveMaterialDto { public string Name { get; set; } = ""; public string? Description { get; set; } public decimal PricePerSquareUnit { get; set; } public bool IsActive { get; set; } = true; }
public class MaterialAdminDto : SaveMaterialDto { public int MaterialId { get; set; } }

public class SaveFrameDto { public string Name { get; set; } = ""; public string? Description { get; set; } public decimal AdditionalPrice { get; set; } public bool IsActive { get; set; } = true; }
public class FrameAdminDto : SaveFrameDto { public int FrameId { get; set; } }

// ---------- Orders ----------
public class AdminOrderQuery { public OrderStatus? Status { get; set; } public string? Search { get; set; } public int Page { get; set; } = 1; public int PageSize { get; set; } = 15; }
public class AdminOrderListDto
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string CustomerEmail { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public OrderStatus OrderStatus { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public bool HasCustomPrint { get; set; }
    public DateTime CreatedAt { get; set; }
}
public class AdvanceOrderStatusDto { public OrderStatus? TargetStatus { get; set; } } // null = advance to next step

// ---------- Dashboard ----------
public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalArtworks { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingSubmissions { get; set; }
    public int PendingOrders { get; set; }
    public int CustomPrintOrders { get; set; }
}
public record MonthlyPointDto(string Month, decimal Revenue, int Orders);
public record PopularArtworkDto(int ArtworkId, string Title, string ImageUrl, int UnitsSold, decimal Revenue);
public record CategorySalesDto(string Category, decimal Revenue, int UnitsSold);

public class DashboardChartsDto
{
    public List<MonthlyPointDto> Monthly { get; set; } = new();
    public List<PopularArtworkDto> PopularArtworks { get; set; } = new();
    public List<CategorySalesDto> SalesByCategory { get; set; } = new();
}