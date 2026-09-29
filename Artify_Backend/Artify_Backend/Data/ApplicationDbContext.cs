using Artify.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ============================================================
    // DB SETS
    // ============================================================

    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Artwork> Artworks => Set<Artwork>();
    public DbSet<ArtworkVariant> ArtworkVariants => Set<ArtworkVariant>();
    public DbSet<ArtworkSubmission> ArtworkSubmissions => Set<ArtworkSubmission>();
    public DbSet<PrintMaterial> PrintMaterials => Set<PrintMaterial>();
    public DbSet<Frame> Frames => Set<Frame>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();


    // ============================================================
    // MODEL CONFIGURATION
    // ============================================================

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);


        // ========================================================
        // PRIMARY KEYS
        // ========================================================

        b.Entity<User>()
            .HasKey(x => x.UserId);

        b.Entity<Address>()
            .HasKey(x => x.AddressId);

        b.Entity<Category>()
            .HasKey(x => x.CategoryId);

        b.Entity<Artwork>()
            .HasKey(x => x.ArtworkId);

        b.Entity<ArtworkVariant>()
            .HasKey(x => x.ArtworkVariantId);

        // Explicitly configured because the property is
        // SubmissionId instead of ArtworkSubmissionId
        b.Entity<ArtworkSubmission>()
            .HasKey(x => x.SubmissionId);

        // Explicitly configured because the property is
        // MaterialId instead of PrintMaterialId
        b.Entity<PrintMaterial>()
            .HasKey(x => x.MaterialId);

        // Explicitly configured because the property is
        // FrameId, which EF may not infer reliably in this model
        b.Entity<Frame>()
            .HasKey(x => x.FrameId);

        b.Entity<Cart>()
            .HasKey(x => x.CartId);

        b.Entity<CartItem>()
            .HasKey(x => x.CartItemId);

        b.Entity<WishlistItem>()
            .HasKey(x => x.WishlistItemId);

        b.Entity<Order>()
            .HasKey(x => x.OrderId);

        b.Entity<OrderItem>()
            .HasKey(x => x.OrderItemId);

        b.Entity<Payment>()
            .HasKey(x => x.PaymentId);

        b.Entity<Review>()
            .HasKey(x => x.ReviewId);

        // One row per variant per cart; custom prints (null variant) are unaffected
        b.Entity<CartItem>()
            .HasIndex(x => new { x.CartId, x.ArtworkVariantId })
            .IsUnique()
            .HasFilter("[ArtworkVariantId] IS NOT NULL");

        b.Entity<Address>().HasIndex(x => x.UserId);

        b.Entity<OrderItem>().Property(x => x.ItemType).HasConversion<string>().HasMaxLength(20);
        b.Entity<Order>().HasIndex(x => new { x.UserId, x.CreatedAt });


        // ========================================================
        // DECIMAL / MONEY COLUMNS
        // ========================================================

        foreach (var property in b.Model
            .GetEntityTypes()
            .SelectMany(entity => entity.GetProperties())
            .Where(property =>
                property.ClrType == typeof(decimal) ||
                property.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }


        // ========================================================
        // USER
        // ========================================================

        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email)
                .IsUnique();

            e.Property(x => x.Email)
                .HasMaxLength(256);

            e.Property(x => x.Role)
                .HasConversion<string>()
                .HasMaxLength(20);


            // User -> Cart
            // One user has one cart
            e.HasOne(x => x.Cart)
                .WithOne(x => x.User)
                .HasForeignKey<Cart>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // User -> Addresses
            e.HasMany(x => x.Addresses)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // User -> Wishlist
            e.HasMany(x => x.WishlistItems)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);


            // User -> Orders
            e.HasMany(x => x.Orders)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // ADDRESS
        // ========================================================

        b.Entity<Address>(e =>
        {
            e.Property(x => x.FullName)
                .HasMaxLength(150);

            e.Property(x => x.PhoneNumber)
                .HasMaxLength(30);

            e.Property(x => x.AddressLine1)
                .HasMaxLength(250);

            e.Property(x => x.AddressLine2)
                .HasMaxLength(250);

            e.Property(x => x.City)
                .HasMaxLength(100);

            e.Property(x => x.State)
                .HasMaxLength(100);

            e.Property(x => x.PostalCode)
                .HasMaxLength(30);

            e.Property(x => x.Country)
                .HasMaxLength(100);
        });


        // ========================================================
        // CATEGORY
        // ========================================================

        b.Entity<Category>(e =>
        {
            e.HasIndex(x => x.Slug)
                .IsUnique();

            e.Property(x => x.Name)
                .HasMaxLength(100);

            e.Property(x => x.Slug)
                .HasMaxLength(120);
        });


        // ========================================================
        // ARTWORK
        // ========================================================

        b.Entity<Artwork>(e =>
        {
            e.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.Property(x => x.ArtworkType)
                .HasConversion<string>()
                .HasMaxLength(30);


            // Artwork -> Category
            e.HasOne(x => x.Category)
                .WithMany(x => x.Artworks)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);


            // Artwork -> Variants
            e.HasMany(x => x.Variants)
                .WithOne(x => x.Artwork)
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);


            // Artwork -> Reviews
            e.HasMany(x => x.Reviews)
                .WithOne(x => x.Artwork)
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // ARTWORK VARIANT
        // ========================================================

        b.Entity<ArtworkVariant>(e =>
        {
            e.Property(x => x.VariantType)
                .HasConversion<string>()
                .HasMaxLength(20);


            e.HasOne(x => x.Artwork)
                .WithMany(x => x.Variants)
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // ARTWORK SUBMISSION
        // ========================================================

        b.Entity<ArtworkSubmission>(e =>
        {
            e.HasKey(x => x.SubmissionId);


            e.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.Property(x => x.ArtworkType)
                .HasConversion<string>()
                .HasMaxLength(30);

            e.HasIndex(x => x.Status);


            // Submission -> Category
            e.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // PRINT MATERIAL
        // ========================================================

        b.Entity<PrintMaterial>(e =>
        {
            e.HasKey(x => x.MaterialId);

            e.Property(x => x.Name)
                .HasMaxLength(100);

            e.Property(x => x.Description)
                .HasMaxLength(500);
        });


        // ========================================================
        // FRAME
        // ========================================================

        b.Entity<Frame>(e =>
        {
            e.HasKey(x => x.FrameId);

            e.Property(x => x.Name)
                .HasMaxLength(100);

            e.Property(x => x.Description)
                .HasMaxLength(500);
        });


        // ========================================================
        // CART
        // ========================================================

        b.Entity<Cart>(e =>
        {
            e.HasKey(x => x.CartId);


            e.HasOne(x => x.User)
                .WithOne(x => x.Cart)
                .HasForeignKey<Cart>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // CART ITEM
        // ========================================================

        b.Entity<CartItem>(e =>
        {
            e.HasKey(x => x.CartItemId);


            e.Property(x => x.ItemType)
                .HasConversion<string>()
                .HasMaxLength(20);


            // Cart -> CartItems
            e.HasOne(x => x.Cart)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);


            // Existing artwork
            e.HasOne(x => x.Artwork)
                .WithMany()
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.NoAction);


            // Artwork variant
            e.HasOne(x => x.ArtworkVariant)
                .WithMany()
                .HasForeignKey(x => x.ArtworkVariantId)
                .OnDelete(DeleteBehavior.NoAction);


            // Print material
            e.HasOne(x => x.Material)
                .WithMany()
                .HasForeignKey(x => x.MaterialId)
                .OnDelete(DeleteBehavior.NoAction);


            // Frame
            e.HasOne(x => x.Frame)
                .WithMany()
                .HasForeignKey(x => x.FrameId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // WISHLIST
        // ========================================================

        b.Entity<WishlistItem>(e =>
        {
            e.HasKey(x => x.WishlistItemId);


            // Prevent duplicate wishlist entries
            e.HasIndex(x => new
            {
                x.UserId,
                x.ArtworkId
            })
            .IsUnique();


            e.HasOne(x => x.User)
                .WithMany(x => x.WishlistItems)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);


            e.HasOne(x => x.Artwork)
                .WithMany()
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // ORDER
        // ========================================================

        b.Entity<Order>(e =>
        {
            e.HasKey(x => x.OrderId);


            e.HasIndex(x => x.OrderNumber)
                .IsUnique();


            e.Property(x => x.OrderStatus)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.Property(x => x.PaymentStatus)
                .HasConversion<string>()
                .HasMaxLength(20);


            // Order -> User
            e.HasOne(x => x.User)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);


            // Order -> Items
            e.HasMany(x => x.Items)
                .WithOne(x => x.Order)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);


            // Order -> Payment
            e.HasOne(x => x.Payment)
                .WithOne(x => x.Order)
                .HasForeignKey<Payment>(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // ORDER ITEM
        // ========================================================

        b.Entity<OrderItem>(e =>
        {
            e.HasKey(x => x.OrderItemId);


            e.HasOne(x => x.Order)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);


            // Optional artwork
            e.HasOne<Artwork>()
                .WithMany()
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.NoAction);


            // Optional variant
            e.HasOne<ArtworkVariant>()
                .WithMany()
                .HasForeignKey(x => x.ArtworkVariantId)
                .OnDelete(DeleteBehavior.NoAction);


            // Optional material
            e.HasOne<PrintMaterial>()
                .WithMany()
                .HasForeignKey(x => x.MaterialId)
                .OnDelete(DeleteBehavior.NoAction);


            // Optional frame
            e.HasOne<Frame>()
                .WithMany()
                .HasForeignKey(x => x.FrameId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // PAYMENT
        // ========================================================

        b.Entity<Payment>(e =>
        {
            e.HasKey(x => x.PaymentId);


            e.Property(x => x.PaymentMethod)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.Property(x => x.PaymentStatus)
                .HasConversion<string>()
                .HasMaxLength(20);


            e.HasOne(x => x.Order)
                .WithOne(x => x.Payment)
                .HasForeignKey<Payment>(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // REVIEW
        // ========================================================

        b.Entity<Review>(e =>
        {
            e.HasKey(x => x.ReviewId);


            // One review per user/artwork/order
            e.HasIndex(x => new
            {
                x.UserId,
                x.ArtworkId,
                x.OrderId
            })
            .IsUnique();


            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);


            e.HasOne(x => x.Artwork)
                .WithMany(x => x.Reviews)
                .HasForeignKey(x => x.ArtworkId)
                .OnDelete(DeleteBehavior.NoAction);
        });


        // ========================================================
        // SEED DATA
        // ========================================================

        Seed(b);
    }


    // ============================================================
    // SEED DATA
    // ============================================================

    private static void Seed(ModelBuilder b)
    {
        // --------------------------------------------------------
        // CATEGORIES
        // --------------------------------------------------------

        var categories = new[]
        {
            "Landscape",
            "Portrait",
            "Abstract",
            "Traditional",
            "Digital Art",
            "Photography",
            "Minimalist",
            "Mandala",
            "Nepali Art"
        };

        b.Entity<Category>().HasData(
            categories.Select((name, index) => new Category
            {
                CategoryId = index + 1,
                Name = name,
                Slug = name.ToLower().Replace(' ', '-')
            })
        );


        // --------------------------------------------------------
        // PRINT MATERIALS
        // --------------------------------------------------------

        b.Entity<PrintMaterial>().HasData(
            new PrintMaterial
            {
                MaterialId = 1,
                Name = "Matte Paper",
                PricePerSquareUnit = 1.5m
            },
            new PrintMaterial
            {
                MaterialId = 2,
                Name = "Glossy Paper",
                PricePerSquareUnit = 1.8m
            },
            new PrintMaterial
            {
                MaterialId = 3,
                Name = "Photo Paper",
                PricePerSquareUnit = 2.5m
            },
            new PrintMaterial
            {
                MaterialId = 4,
                Name = "Canvas",
                PricePerSquareUnit = 4m
            },
            new PrintMaterial
            {
                MaterialId = 5,
                Name = "Premium Canvas",
                PricePerSquareUnit = 6m
            }
        );


        // --------------------------------------------------------
        // FRAMES
        // --------------------------------------------------------

        b.Entity<Frame>().HasData(
            new Frame
            {
                FrameId = 1,
                Name = "No Frame",
                AdditionalPrice = 0
            },
            new Frame
            {
                FrameId = 2,
                Name = "Black",
                AdditionalPrice = 800
            },
            new Frame
            {
                FrameId = 3,
                Name = "White",
                AdditionalPrice = 800
            },
            new Frame
            {
                FrameId = 4,
                Name = "Wooden",
                AdditionalPrice = 1200
            },
            new Frame
            {
                FrameId = 5,
                Name = "Premium",
                AdditionalPrice = 2000
            }
        );
    }
}