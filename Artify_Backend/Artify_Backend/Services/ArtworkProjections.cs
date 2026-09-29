using System.Linq.Expressions;
using Artify.API.DTOs;
using Artify.API.Entities;

namespace Artify.API.Services;

public static class ArtworkProjections
{
    public static readonly Expression<Func<Artwork, ArtworkListDto>> ToListDto = a => new ArtworkListDto
    {
        ArtworkId = a.ArtworkId,
        Title = a.Title,
        ImageUrl = a.ImageUrl,
        ThumbnailUrl = a.ThumbnailUrl,
        Category = a.Category.Name,
        CategorySlug = a.Category.Slug,
        ArtworkType = a.ArtworkType,
        Status = a.Status,
        FromPrice = a.Variants.Where(v => v.IsAvailable).Min(v => (decimal?)v.BasePrice) ?? a.OriginalPrice,
        AverageRating = a.Reviews.Where(r => r.IsApproved).Average(r => (double?)r.Rating) ?? 0,
        ReviewCount = a.Reviews.Count(r => r.IsApproved),
        IsOriginalAvailable = a.IsOriginalAvailable,
        IsPrintAvailable = a.IsPrintAvailable,
        CreatedAt = a.CreatedAt
    };
}