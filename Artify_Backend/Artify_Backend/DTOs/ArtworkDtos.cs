using Artify.API.Entities;

namespace Artify.API.DTOs;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class ArtworkQuery
{
    public string? Search { get; set; }
    public string? Category { get; set; }          // category slug
    public ArtworkType? ArtworkType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? OriginalAvailable { get; set; }
    public bool? PrintAvailable { get; set; }
    public double? MinRating { get; set; }
    public string? Sort { get; set; }              // newest | price_asc | price_desc | rating | popular
    public ArtworkStatus? Status { get; set; }     // honoured for admin only
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class ArtworkListDto
{
    public int ArtworkId { get; set; }
    public string Title { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public string? ThumbnailUrl { get; set; }
    public string Category { get; set; } = "";
    public string CategorySlug { get; set; } = "";
    public ArtworkType ArtworkType { get; set; }
    public ArtworkStatus Status { get; set; }
    public decimal FromPrice { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsOriginalAvailable { get; set; }
    public bool IsPrintAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VariantDto
{
    public int ArtworkVariantId { get; set; }
    public VariantType VariantType { get; set; }
    public decimal BasePrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; }
}

public class ArtworkDetailDto : ArtworkListDto
{
    public string Description { get; set; } = "";
    public int CategoryId { get; set; }
    public decimal OriginalPrice { get; set; }
    public List<VariantDto> Variants { get; set; } = new();
}

public class SaveVariantDto
{
    public VariantType VariantType { get; set; }
    public decimal BasePrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class SaveArtworkDto
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; } = "";
    public string? ThumbnailUrl { get; set; }
    public ArtworkType ArtworkType { get; set; }
    public decimal OriginalPrice { get; set; }
    public bool IsOriginalAvailable { get; set; } = true;
    public bool IsPrintAvailable { get; set; } = true;
    public ArtworkStatus Status { get; set; } = ArtworkStatus.Draft;
    public List<SaveVariantDto> Variants { get; set; } = new();
}

public record CategoryDto(int CategoryId, string Name, string Slug, int ArtworkCount);
public record SaveCategoryDto(string Name);

public class HomeDataDto
{
    public List<ArtworkListDto> Featured { get; set; } = new();
    public List<ArtworkListDto> Popular { get; set; } = new();
    public List<ArtworkListDto> NewArrivals { get; set; } = new();
    public List<CategoryDto> Categories { get; set; } = new();
    public List<HomeReviewDto> Testimonials { get; set; } = new();
}

public class HomeReviewDto
{
    public string ReviewerName { get; set; } = "";
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string ArtworkTitle { get; set; } = "";
}