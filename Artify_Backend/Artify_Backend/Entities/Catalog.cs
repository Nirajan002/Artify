using Microsoft.AspNetCore.Mvc.ViewEngines;
using System.ComponentModel.DataAnnotations;

namespace Artify.API.Entities;

public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}

public class Artwork
{
    public int ArtworkId { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string ImageUrl { get; set; } = "";
    public string? ThumbnailUrl { get; set; }
    public ArtworkType ArtworkType { get; set; }
    public decimal OriginalPrice { get; set; }
    public bool IsOriginalAvailable { get; set; } = true;
    public bool IsPrintAvailable { get; set; } = true;
    public ArtworkStatus Status { get; set; } = ArtworkStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ArtworkVariant> Variants { get; set; } = new List<ArtworkVariant>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class ArtworkVariant
{
    public int ArtworkVariantId { get; set; }
    public int ArtworkId { get; set; }
    public Artwork Artwork { get; set; } = null!;
    public VariantType VariantType { get; set; }
    public decimal BasePrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class ArtworkSubmission
{
    public int SubmissionId { get; set; }
    public string SubmitterName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public ArtworkType ArtworkType { get; set; }
    public decimal OriginalPrice { get; set; }
    public string ImageUrl { get; set; } = "";
    public string? AdditionalInformation { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
    public string? AdminComment { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public int? ReviewedByUserId { get; set; }   // which admin reviewed it
    public int? ArtworkId { get; set; }          // the Artwork created on approval

    [Timestamp] public byte[] RowVersion { get; set; } = Array.Empty<byte>(); // stops two admins reviewing at once
}

public class PrintMaterial
{
    public int MaterialId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal PricePerSquareUnit { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Frame
{
    public int FrameId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal AdditionalPrice { get; set; }
    public bool IsActive { get; set; } = true;
}