using System.Text.RegularExpressions;
using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class CategoryService(ApplicationDbContext db) : ICategoryService
{
    public Task<List<CategoryDto>> GetAllAsync() =>
        db.Categories.AsNoTracking().OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.CategoryId, c.Name, c.Slug,
                c.Artworks.Count(a => a.Status == ArtworkStatus.Published)))
            .ToListAsync();

    public async Task<CategoryDto> CreateAsync(SaveCategoryDto dto)
    {
        var (name, slug) = Normalize(dto.Name);
        if (await db.Categories.AnyAsync(c => c.Slug == slug))
            throw new InvalidOperationException("Category already exists");
        var c = new Category { Name = name, Slug = slug };
        db.Categories.Add(c);
        await db.SaveChangesAsync();
        return new CategoryDto(c.CategoryId, c.Name, c.Slug, 0);
    }

    public async Task<CategoryDto> UpdateAsync(int id, SaveCategoryDto dto)
    {
        var c = await db.Categories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        var (name, slug) = Normalize(dto.Name);
        if (await db.Categories.AnyAsync(x => x.Slug == slug && x.CategoryId != id))
            throw new InvalidOperationException("Category already exists");
        c.Name = name; c.Slug = slug;
        await db.SaveChangesAsync();
        return new CategoryDto(c.CategoryId, c.Name, c.Slug, await db.Artworks.CountAsync(a => a.CategoryId == id));
    }

    public async Task DeleteAsync(int id)
    {
        var c = await db.Categories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        if (await db.Artworks.AnyAsync(a => a.CategoryId == id) || await db.ArtworkSubmissions.AnyAsync(s => s.CategoryId == id))
            throw new InvalidOperationException("Category is in use and cannot be deleted");
        db.Categories.Remove(c);
        await db.SaveChangesAsync();
    }

    private static (string name, string slug) Normalize(string raw)
    {
        var name = raw.Trim();
        var slug = Regex.Replace(name.ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
        return (name, slug);
    }
}