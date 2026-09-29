using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class CartService(ApplicationDbContext db, IPrintPricingService pricing, IImageStorageService storage) : ICartService
{
    public async Task<CartDto> GetAsync(int userId) => await BuildAsync(await LoadCartAsync(userId));

    public Task<CartDto> AddItemAsync(int userId, AddCartItemDto dto) =>
        dto.ItemType == CartItemType.CustomPrint ? AddCustomPrintAsync(userId, dto) : AddArtworkAsync(userId, dto);

    private async Task<CartDto> AddArtworkAsync(int userId, AddCartItemDto dto)
    {
        if (dto.ArtworkVariantId is null) throw new InvalidOperationException("Choose a version to add");

        var variant = await db.ArtworkVariants.Include(v => v.Artwork)
            .FirstOrDefaultAsync(v => v.ArtworkVariantId == dto.ArtworkVariantId)
            ?? throw new KeyNotFoundException("Artwork version not found");

        var cart = await LoadCartAsync(userId);
        var existing = cart.Items.FirstOrDefault(i => i.ArtworkVariantId == variant.ArtworkVariantId);
        var newQty = (existing?.Quantity ?? 0) + dto.Quantity;

        if (newQty > CartRules.MaxQuantityFor(variant))
            throw new InvalidOperationException(variant.VariantType == VariantType.Original
                ? "An original artwork can only be added once"
                : $"You can order at most {CartRules.MaxQuantityPerItem} of the same item");

        var item = existing ?? new CartItem
        {
            CartId = cart.CartId,
            ItemType = CartItemType.Artwork,
            ArtworkId = variant.ArtworkId,
            ArtworkVariantId = variant.ArtworkVariantId,
            Artwork = variant.Artwork,
            ArtworkVariant = variant
        };
        item.Quantity = newQty;
        item.UnitPrice = variant.BasePrice;

        var issue = CartRules.GetIssue(item);
        if (issue is not null) throw new InvalidOperationException(issue);

        if (existing is null) cart.Items.Add(item);
        cart.UpdatedAt = DateTime.UtcNow;

        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { throw new InvalidOperationException("That item was just added. Please refresh your cart."); }
        return await BuildAsync(cart);
    }

    private async Task<CartDto> AddCustomPrintAsync(int userId, AddCartItemDto dto)
    {
        if (dto.CustomWidth is null || dto.CustomHeight is null || dto.MaterialId is null || dto.FrameId is null)
            throw new InvalidOperationException("Choose a size, material and frame");
        if (!storage.IsStoredUpload(dto.CustomArtworkUrl, "custom-art"))
            throw new InvalidOperationException("Please upload your artwork image first");

        var material = await db.PrintMaterials.FindAsync(dto.MaterialId) ?? throw new KeyNotFoundException("Material not found");
        var frame = await db.Frames.FindAsync(dto.FrameId) ?? throw new KeyNotFoundException("Frame not found");
        var width = Math.Round(dto.CustomWidth.Value, 2);
        var height = Math.Round(dto.CustomHeight.Value, 2);

        var cart = await LoadCartAsync(userId);

        // The same file, size, material and frame becomes one line with a higher quantity
        var existing = cart.Items.FirstOrDefault(i =>
            i.ItemType == CartItemType.CustomPrint && i.CustomArtworkUrl == dto.CustomArtworkUrl
            && i.CustomWidth == width && i.CustomHeight == height
            && i.MaterialId == material.MaterialId && i.FrameId == frame.FrameId);

        var quantity = (existing?.Quantity ?? 0) + dto.Quantity;
        if (quantity > CartRules.MaxQuantityPerItem)
            throw new InvalidOperationException($"You can order at most {CartRules.MaxQuantityPerItem} of the same print");

        // Validates the size, quantity and active material/frame, and computes the price on the server
        var price = pricing.Calculate(width, height, material, frame, quantity);

        if (existing is null)
            cart.Items.Add(new CartItem
            {
                CartId = cart.CartId,
                ItemType = CartItemType.CustomPrint,
                Quantity = quantity,
                UnitPrice = price.UnitPrice,
                CustomArtworkUrl = dto.CustomArtworkUrl,
                CustomWidth = width,
                CustomHeight = height,
                MaterialId = material.MaterialId,
                Material = material,
                FrameId = frame.FrameId,
                Frame = frame
            });
        else { existing.Quantity = quantity; existing.UnitPrice = price.UnitPrice; }

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await BuildAsync(cart);
    }

    public async Task<CartDto> UpdateQuantityAsync(int userId, int itemId, int quantity)
    {
        var cart = await LoadCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == itemId)
            ?? throw new KeyNotFoundException("Cart item not found");

        var max = item.ArtworkVariant is null ? CartRules.MaxQuantityPerItem : CartRules.MaxQuantityFor(item.ArtworkVariant);
        if (quantity < 1 || quantity > max)
            throw new InvalidOperationException($"Quantity must be between 1 and {max}");

        item.Quantity = quantity;
        var (issue, _) = Evaluate(item);
        if (issue is not null) throw new InvalidOperationException(issue);

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await BuildAsync(cart);
    }

    public async Task<CartDto> RemoveItemAsync(int userId, int itemId)
    {
        var cart = await LoadCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == itemId)
            ?? throw new KeyNotFoundException("Cart item not found");
        db.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await BuildAsync(cart);
    }

    public async Task<CartDto> ClearAsync(int userId)
    {
        var cart = await LoadCartAsync(userId);
        db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await BuildAsync(cart);
    }

    private async Task<Cart> LoadCartAsync(int userId)
    {
        var cart = await db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Artwork)
            .Include(c => c.Items).ThenInclude(i => i.ArtworkVariant)
            .Include(c => c.Items).ThenInclude(i => i.Material)
            .Include(c => c.Items).ThenInclude(i => i.Frame)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null)
        {
            cart = new Cart { UserId = userId };
            db.Carts.Add(cart);
            await db.SaveChangesAsync();
        }
        return cart;
    }

    // Refreshes the item's price from current data and reports why it can't be bought, if it can't
    private (string? Issue, bool PriceChanged) Evaluate(CartItem i)
    {
        decimal? current;
        string? issue;

        if (i.ItemType == CartItemType.Artwork)
        {
            current = i.ArtworkVariant?.BasePrice;
            issue = CartRules.GetIssue(i);
        }
        else
            (current, issue) = pricing.EvaluateCartItem(i);

        if (current is not null && i.UnitPrice != current)
        {
            i.UnitPrice = current.Value;
            return (issue, true);
        }
        return (issue, false);
    }

    private async Task<CartDto> BuildAsync(Cart cart)
    {
        var changed = false;
        var items = new List<CartItemDto>();

        foreach (var i in cart.Items.OrderBy(x => x.CartItemId))
        {
            var (issue, priceChanged) = Evaluate(i);
            changed |= priceChanged;
            items.Add(ToDto(i, issue));
        }

        if (changed) { cart.UpdatedAt = DateTime.UtcNow; await db.SaveChangesAsync(); }

        return new CartDto
        {
            Items = items,
            ItemCount = items.Sum(x => x.Quantity),
            Subtotal = items.Where(x => x.Issue is null).Sum(x => x.LineTotal),
            HasIssues = items.Any(x => x.Issue is not null)
        };
    }

    private static CartItemDto ToDto(CartItem i, string? issue) => new()
    {
        CartItemId = i.CartItemId,
        ItemType = i.ItemType,
        ArtworkId = i.ArtworkId,
        ArtworkVariantId = i.ArtworkVariantId,
        VariantType = i.ArtworkVariant?.VariantType,
        Title = i.ItemType == CartItemType.Artwork ? i.Artwork?.Title ?? "Unavailable artwork" : "Custom print",
        ImageUrl = i.ItemType == CartItemType.Artwork
            ? i.Artwork?.ThumbnailUrl ?? i.Artwork?.ImageUrl ?? ""
            : i.CustomArtworkUrl ?? "",
        Quantity = i.Quantity,
        UnitPrice = i.UnitPrice,
        LineTotal = i.UnitPrice * i.Quantity,
        Issue = issue,
        CustomWidth = i.CustomWidth,
        CustomHeight = i.CustomHeight,
        MaterialName = i.Material?.Name,
        FrameName = i.Frame?.Name
    };
}