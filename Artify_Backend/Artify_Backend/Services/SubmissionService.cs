using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class SubmissionService(ApplicationDbContext db, IImageStorageService storage) : ISubmissionService
{
    public async Task<SubmissionCreatedDto> CreateAsync(CreateSubmissionDto dto)
    {
        if (!await db.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId))
            throw new InvalidOperationException("Category does not exist");
        if (!storage.IsStoredUpload(dto.ImageUrl, "submissions"))
            throw new InvalidOperationException("Please upload a valid artwork image");

        var s = new ArtworkSubmission
        {
            SubmitterName = dto.SubmitterName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            CategoryId = dto.CategoryId,
            ArtworkType = dto.ArtworkType,
            OriginalPrice = dto.OriginalPrice,
            ImageUrl = dto.ImageUrl,
            AdditionalInformation = dto.AdditionalInformation?.Trim(),
            Status = SubmissionStatus.Pending,      // always Pending, never from the client
            SubmittedAt = DateTime.UtcNow
        };
        db.ArtworkSubmissions.Add(s);
        await db.SaveChangesAsync();
        return new SubmissionCreatedDto(s.SubmissionId, s.Status.ToString());
    }

    public async Task<PagedResult<SubmissionListDto>> GetListAsync(SubmissionQuery q)
    {
        var page = Math.Max(q.Page, 1);
        var size = Math.Clamp(q.PageSize, 1, 50);

        var src = db.ArtworkSubmissions.AsNoTracking().AsQueryable();
        if (q.Status.HasValue) src = src.Where(s => s.Status == q.Status);
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var t = q.Search.Trim();
            src = src.Where(s => s.Title.Contains(t) || s.SubmitterName.Contains(t) || s.Email.Contains(t));
        }

        var total = await src.CountAsync();
        var items = await src
            .OrderBy(s => s.Status == SubmissionStatus.Pending ? 0 : 1)   // pending first
            .ThenByDescending(s => s.SubmittedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(s => new SubmissionListDto
            {
                SubmissionId = s.SubmissionId,
                Title = s.Title,
                SubmitterName = s.SubmitterName,
                Email = s.Email,
                ImageUrl = s.ImageUrl,
                Category = s.Category.Name,
                OriginalPrice = s.OriginalPrice,
                Status = s.Status,
                SubmittedAt = s.SubmittedAt
            })
            .ToListAsync();

        return new PagedResult<SubmissionListDto> { Items = items, Page = page, PageSize = size, TotalCount = total };
    }

    public async Task<SubmissionDetailDto> GetByIdAsync(int id)
    {
        var dto = await db.ArtworkSubmissions.AsNoTracking()
            .Where(s => s.SubmissionId == id)
            .Select(s => new SubmissionDetailDto
            {
                SubmissionId = s.SubmissionId,
                Title = s.Title,
                SubmitterName = s.SubmitterName,
                Email = s.Email,
                PhoneNumber = s.PhoneNumber,
                ImageUrl = s.ImageUrl,
                Description = s.Description,
                CategoryId = s.CategoryId,
                Category = s.Category.Name,
                ArtworkType = s.ArtworkType,
                OriginalPrice = s.OriginalPrice,
                AdditionalInformation = s.AdditionalInformation,
                Status = s.Status,
                AdminComment = s.AdminComment,
                SubmittedAt = s.SubmittedAt,
                ReviewedAt = s.ReviewedAt,
                ArtworkId = s.ArtworkId
            })
            .FirstOrDefaultAsync();

        return dto ?? throw new KeyNotFoundException("Submission not found");
    }

    public async Task<SubmissionDetailDto> ApproveAsync(int id, int adminId, string? comment)
    {
        var s = await FindPendingAsync(id);

        // 1. Validate the submission again before publishing anything
        if (!await db.Categories.AnyAsync(c => c.CategoryId == s.CategoryId))
            throw new InvalidOperationException("The submission's category no longer exists");
        if (s.OriginalPrice < 0)
            throw new InvalidOperationException("Invalid price");
        if (!storage.IsStoredUpload(s.ImageUrl, "submissions"))
            throw new InvalidOperationException("The submission's image file is missing");

        // 2. Copy the image so the artwork doesn't depend on the submissions folder
        var newUrl = await storage.CopyAsync(s.ImageUrl, "submissions", "artworks");

        try
        {
            await using var tx = await db.Database.BeginTransactionAsync();

            // 3. Create the artwork from the submission data and publish it
            var artwork = new Artwork
            {
                Title = s.Title,
                Description = s.Description,
                CategoryId = s.CategoryId,
                ImageUrl = newUrl,
                ThumbnailUrl = newUrl,
                ArtworkType = s.ArtworkType,
                OriginalPrice = s.OriginalPrice,
                IsOriginalAvailable = true,
                IsPrintAvailable = false,          // admin enables prints after checking image quality
                Status = ArtworkStatus.Published,
                Variants =
                {
                    new ArtworkVariant
                    {
                        VariantType = VariantType.Original, BasePrice = s.OriginalPrice,
                        StockQuantity = 1, IsAvailable = true
                    }
                }
            };
            db.Artworks.Add(artwork);
            await db.SaveChangesAsync();

            // 4. Mark the submission approved and record who reviewed it (the row itself is kept)
            s.Status = SubmissionStatus.Approved;
            s.AdminComment = comment?.Trim();
            s.ReviewedAt = DateTime.UtcNow;
            s.ReviewedByUserId = adminId;
            s.ArtworkId = artwork.ArtworkId;
            await db.SaveChangesAsync();

            await tx.CommitAsync();
        }
        catch
        {
            storage.Delete(newUrl);   // don't leave an orphaned copy behind
            throw;
        }

        return await GetByIdAsync(id);
    }

    public async Task<SubmissionDetailDto> RejectAsync(int id, int adminId, string reason)
    {
        var s = await FindPendingAsync(id);
        s.Status = SubmissionStatus.Rejected;
        s.AdminComment = reason.Trim();
        s.ReviewedAt = DateTime.UtcNow;
        s.ReviewedByUserId = adminId;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    private async Task<ArtworkSubmission> FindPendingAsync(int id)
    {
        var s = await db.ArtworkSubmissions.FirstOrDefaultAsync(x => x.SubmissionId == id)
            ?? throw new KeyNotFoundException("Submission not found");
        if (s.Status != SubmissionStatus.Pending)
            throw new InvalidOperationException($"This submission has already been {s.Status.ToString().ToLower()}");
        return s;
    }
}