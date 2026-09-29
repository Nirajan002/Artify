using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class ArtworkService(ApplicationDbContext db) : IArtworkService
{
    public async Task<PagedResult<ArtworkListDto>> GetListAsync(ArtworkQuery q, bool publicOnly)
    {
        var page = Math.Max(q.Page, 1);
        var size = Math.Clamp(q.PageSize, 1, 48);

        var src = db.Artworks.AsNoTracking().AsQueryable();
        if (publicOnly) src = src.Where(a => a.Status == ArtworkStatus.Published);   // public store rule
        else if (q.Status.HasValue) src = src.Where(a => a.Status == q.Status);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim();
            src = src.Where(a => a.Title.Contains(s) || a.Description.Contains(s) || a.Category.Name.Contains(s));
        }
        if (!string.IsNullOrWhiteSpace(q.Category)) src = src.Where(a => a.Category.Slug == q.Category);
        if (q.ArtworkType.HasValue) src = src.Where(a => a.ArtworkType == q.ArtworkType);
        if (q.OriginalAvailable == true) src = src.Where(a => a.IsOriginalAvailable);
        if (q.PrintAvailable == true) src = src.Where(a => a.IsPrintAvailable);

        var list = src.Select(ArtworkProjections.ToListDto);

        if (q.MinPrice.HasValue) list = list.Where(d => d.FromPrice >= q.MinPrice);
        if (q.MaxPrice.HasValue) list = list.Where(d => d.FromPrice <= q.MaxPrice);
        if (q.MinRating.HasValue) list = list.Where(d => d.AverageRating >= q.MinRating);

        list = q.Sort switch
        {
            "price_asc" => list.OrderBy(d => d.FromPrice).ThenBy(d => d.ArtworkId),
            "price_desc" => list.OrderByDescending(d => d.FromPrice).ThenBy(d => d.ArtworkId),
            "rating" => list.OrderByDescending(d => d.AverageRating).ThenBy(d => d.ArtworkId),
            "popular" => list.OrderByDescending(d => d.ReviewCount).ThenBy(d => d.ArtworkId),
            _ => list.OrderByDescending(d => d.CreatedAt).ThenBy(d => d.ArtworkId)
        };

        var total = await list.CountAsync();
        var items = await list.Skip((page - 1) * size).Take(size).ToListAsync();
        return new PagedResult<ArtworkListDto> { Items = items, Page = page, PageSize = size, TotalCount = total };
    }

    public async Task<ArtworkDetailDto> GetByIdAsync(int id, bool publicOnly)
    {
        var dto = await db.Artworks.AsNoTracking()
            .Where(a => a.ArtworkId == id && (!publicOnly || a.Status == ArtworkStatus.Published))
            .Select(a => new ArtworkDetailDto
            {
                ArtworkId = a.ArtworkId,
                Title = a.Title,
                Description = a.Description,
                ImageUrl = a.ImageUrl,
                ThumbnailUrl = a.ThumbnailUrl,
                CategoryId = a.CategoryId,
                Category = a.Category.Name,
                CategorySlug = a.Category.Slug,
                ArtworkType = a.ArtworkType,
                Status = a.Status,
                OriginalPrice = a.OriginalPrice,
                FromPrice = a.Variants.Where(v => v.IsAvailable).Min(v => (decimal?)v.BasePrice) ?? a.OriginalPrice,
                AverageRating = a.Reviews.Where(r => r.IsApproved).Average(r => (double?)r.Rating) ?? 0,
                ReviewCount = a.Reviews.Count(r => r.IsApproved),
                IsOriginalAvailable = a.IsOriginalAvailable,
                IsPrintAvailable = a.IsPrintAvailable,
                CreatedAt = a.CreatedAt,
                Variants = a.Variants.Where(v => !publicOnly || v.IsAvailable)
                    .Select(v => new VariantDto
                    {
                        ArtworkVariantId = v.ArtworkVariantId,
                        VariantType = v.VariantType,
                        BasePrice = v.BasePrice,
                        StockQuantity = v.StockQuantity,
                        IsAvailable = v.IsAvailable
                    }).ToList()
            })
            .FirstOrDefaultAsync();

        return dto ?? throw new KeyNotFoundException("Artwork not found");
    }

    public async Task<ArtworkDetailDto> CreateAsync(SaveArtworkDto dto)
    {
        await EnsureCategoryAsync(dto.CategoryId);
        var artwork = new Artwork();
        Apply(artwork, dto);
        db.Artworks.Add(artwork);
        await db.SaveChangesAsync();
        return await GetByIdAsync(artwork.ArtworkId, publicOnly: false);
    }

    public async Task<ArtworkDetailDto> UpdateAsync(int id, SaveArtworkDto dto)
    {
        var artwork = await db.Artworks.Include(a => a.Variants).FirstOrDefaultAsync(a => a.ArtworkId == id)
            ?? throw new KeyNotFoundException("Artwork not found");
        await EnsureCategoryAsync(dto.CategoryId);
        Apply(artwork, dto);
        artwork.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id, publicOnly: false);
    }

    // Soft delete: order history and cart rows keep pointing at a real row
    public async Task ArchiveAsync(int id)
    {
        var artwork = await db.Artworks.FindAsync(id) ?? throw new KeyNotFoundException("Artwork not found");
        artwork.Status = ArtworkStatus.Archived;
        artwork.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    private async Task EnsureCategoryAsync(int categoryId)
    {
        if (!await db.Categories.AnyAsync(c => c.CategoryId == categoryId))
            throw new InvalidOperationException("Category does not exist");
    }

    private static void Apply(Artwork a, SaveArtworkDto dto)
    {
        a.Title = dto.Title.Trim();
        a.Description = dto.Description.Trim();
        a.CategoryId = dto.CategoryId;
        a.ImageUrl = dto.ImageUrl;
        a.ThumbnailUrl = dto.ThumbnailUrl ?? dto.ImageUrl;
        a.ArtworkType = dto.ArtworkType;
        a.OriginalPrice = dto.OriginalPrice;
        a.IsPrintAvailable = dto.IsPrintAvailable;
        a.Status = dto.Status;
        // A sold original can never be purchased
        a.IsOriginalAvailable = dto.Status != ArtworkStatus.Sold && dto.IsOriginalAvailable;

        // Upsert by variant type; variants that are no longer listed are disabled, not deleted
        foreach (var v in dto.Variants)
        {
            var existing = a.Variants.FirstOrDefault(x => x.VariantType == v.VariantType);
            if (existing is null)
                a.Variants.Add(new ArtworkVariant
                {
                    VariantType = v.VariantType,
                    BasePrice = v.BasePrice,
                    StockQuantity = v.StockQuantity,
                    IsAvailable = v.IsAvailable
                });
            else
            {
                existing.BasePrice = v.BasePrice;
                existing.StockQuantity = v.StockQuantity;
                existing.IsAvailable = v.IsAvailable;
            }
        }
        foreach (var old in a.Variants.Where(x => dto.Variants.All(v => v.VariantType != x.VariantType)))
            old.IsAvailable = false;
    }

    public async Task<HomeDataDto> GetHomeDataAsync()
    {
        var published = db.Artworks.AsNoTracking().Where(a => a.Status == ArtworkStatus.Published);

        // "Featured" = highest rated with at least one review; falls back to newest if nothing has been reviewed yet
        var featured = await published
            .Select(ArtworkProjections.ToListDto)
            .Where(d => d.ReviewCount > 0)
            .OrderByDescending(d => d.AverageRating).ThenByDescending(d => d.ReviewCount)
            .Take(8).ToListAsync();
        if (featured.Count == 0)
            featured = await published.Select(ArtworkProjections.ToListDto).OrderByDescending(d => d.CreatedAt).Take(8).ToListAsync();

        var popular = await published.Select(ArtworkProjections.ToListDto)
            .OrderByDescending(d => d.ReviewCount).ThenByDescending(d => d.CreatedAt).Take(8).ToListAsync();

        var newArrivals = await published.Select(ArtworkProjections.ToListDto)
            .OrderByDescending(d => d.CreatedAt).Take(8).ToListAsync();

        var categories = await db.Categories.AsNoTracking().OrderBy(c => c.Name)
        .Select(c => new
        {
            c.CategoryId,
            c.Name,
            c.Slug,
            Count = c.Artworks.Count(a => a.Status == ArtworkStatus.Published)
        })
    .Where(c => c.Count > 0)
    .Take(9)
    .Select(c => new CategoryDto(c.CategoryId, c.Name, c.Slug, c.Count))
    .ToListAsync();

        var testimonials = await db.Reviews.AsNoTracking()
            .Where(r => r.IsApproved && r.Rating >= 4 && r.Comment != null && r.Comment != "")
            .OrderByDescending(r => r.CreatedAt).Take(6)
            .Select(r => new HomeReviewDto
            {
                ReviewerName = r.User.FirstName + " " + r.User.LastName.Substring(0, 1) + ".",
                Rating = r.Rating,
                Comment = r.Comment,
                ArtworkTitle = r.Artwork.Title
            }).ToListAsync();

        return new HomeDataDto { Featured = featured, Popular = popular, NewArrivals = newArrivals, Categories = categories, Testimonials = testimonials };
    }
}