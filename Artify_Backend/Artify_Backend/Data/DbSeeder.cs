using Artify.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(
            ApplicationDbContext db,
            IConfiguration config)
        {
            // Seed only Admin
            if (!await db.Users.AnyAsync(u => u.Role == UserRole.Admin))
            {
                var adminPassword = config["Seed:AdminPassword"];

                if (string.IsNullOrWhiteSpace(adminPassword))
                {
                    throw new InvalidOperationException(
                        "Seed:AdminPassword is not configured."
                    );
                }

                var admin = new User
                {
                    FirstName = "Artify",
                    LastName = "Admin",
                    Email = "admin@artify.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Role = UserRole.Admin
                };

                db.Users.Add(admin);

                await db.SaveChangesAsync();
            }
        }
    }
}