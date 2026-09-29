using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class WishlistService(ApplicationDbContext db) : IWishlistService
{
    public Task<List<ArtworkListDto>> GetAsync(int userId) =>
        db.WishlistItems.AsNoTracking()
            .Where(w => w.UserId == userId && w.Artwork.Status == ArtworkStatus.Published)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => w.Artwork)
            .Select(ArtworkProjections.ToListDto)
            .ToListAsync();

    public async Task AddAsync(int userId, int artworkId)
    {
        if (!await db.Artworks.AnyAsync(a => a.ArtworkId == artworkId && a.Status == ArtworkStatus.Published))
            throw new KeyNotFoundException("Artwork not found");

        // Duplicates are prevented here and by the unique (UserId, ArtworkId) index
        if (await db.WishlistItems.AnyAsync(w => w.UserId == userId && w.ArtworkId == artworkId)) return;

        db.WishlistItems.Add(new WishlistItem { UserId = userId, ArtworkId = artworkId });
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { /* a parallel request added it first; the result is the same */ }
    }

    public Task RemoveAsync(int userId, int artworkId) =>
        db.WishlistItems.Where(w => w.UserId == userId && w.ArtworkId == artworkId).ExecuteDeleteAsync();
}