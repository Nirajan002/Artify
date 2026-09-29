using Artify.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db, IConfiguration config)
    {
        if (!await db.Users.AnyAsync())
        {
            // Read admin password from configuration / user-secrets, never hardcode
            var adminPw = config["Seed:AdminPassword"] ?? throw new Exception("Seed:AdminPassword missing");
            var customerPw = config["Seed:CustomerPassword"] ?? adminPw;

            db.Users.AddRange(
                new User
                {
                    FirstName = "Admin",
                    LastName = "Artify",
                    Email = "admin@artify.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPw),
                    Role = UserRole.Admin
                },
                new User
                {
                    FirstName = "Ram",
                    LastName = "Sharma",
                    Email = "ram@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(customerPw)
                },
                new User
                {
                    FirstName = "Sita",
                    LastName = "Thapa",
                    Email = "sita@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(customerPw)
                });
            await db.SaveChangesAsync();
        }

        if (!await db.Artworks.AnyAsync())
        {
            var types = Enum.GetValues<ArtworkType>();
            var artworks = Enumerable.Range(1, 18).Select(i => new Artwork
            {
                Title = $"Sample Artwork {i}",
                Description = "A beautiful sample artwork for development.",
                CategoryId = (i % 9) + 1,
                ImageUrl = $"https://picsum.photos/seed/artify{i}/800/1000",
                ThumbnailUrl = $"https://picsum.photos/seed/artify{i}/300/400",
                ArtworkType = types[i % types.Length],
                OriginalPrice = 5000 + i * 1500,
                Status = ArtworkStatus.Published,
                Variants =
                {
                    new ArtworkVariant { VariantType = VariantType.Original, BasePrice = 5000 + i * 1500, StockQuantity = 1 },
                    new ArtworkVariant { VariantType = VariantType.Poster, BasePrice = 1200, StockQuantity = 50 },
                    new ArtworkVariant { VariantType = VariantType.Canvas, BasePrice = 3500, StockQuantity = 30 },
                }
            });
            db.Artworks.AddRange(artworks);
            await db.SaveChangesAsync();
        }
    }
}