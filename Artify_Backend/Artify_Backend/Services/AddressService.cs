using Artify.API.Data;
using Artify.API.DTOs;
using Artify.API.Entities;
using Artify.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Artify.API.Services;

public class AddressService(ApplicationDbContext db) : IAddressService
{
    private const int MaxAddresses = 10;

    public async Task<List<AddressDto>> GetAllAsync(int userId) =>
        (await db.Addresses.AsNoTracking().Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault).ThenBy(a => a.AddressId).ToListAsync())
        .Select(ToDto).ToList();

    public async Task<AddressDto> CreateAsync(int userId, SaveAddressDto dto)
    {
        var all = await db.Addresses.Where(a => a.UserId == userId).ToListAsync();
        if (all.Count >= MaxAddresses) throw new InvalidOperationException($"You can save up to {MaxAddresses} addresses");

        var address = new Address { UserId = userId };
        Apply(address, dto);

        // The first address is always the default
        address.IsDefault = all.Count == 0 || dto.IsDefault;
        if (address.IsDefault) all.ForEach(a => a.IsDefault = false);

        db.Addresses.Add(address);
        await db.SaveChangesAsync();
        return ToDto(address);
    }

    public async Task<AddressDto> UpdateAsync(int userId, int id, SaveAddressDto dto)
    {
        var all = await db.Addresses.Where(a => a.UserId == userId).ToListAsync();
        var address = all.FirstOrDefault(a => a.AddressId == id) ?? throw new KeyNotFoundException("Address not found");

        Apply(address, dto);
        if (dto.IsDefault && !address.IsDefault)
        {
            all.ForEach(a => a.IsDefault = false);
            address.IsDefault = true;
        }
        await db.SaveChangesAsync();
        return ToDto(address);
    }

    public async Task SetDefaultAsync(int userId, int id)
    {
        var all = await db.Addresses.Where(a => a.UserId == userId).ToListAsync();
        var address = all.FirstOrDefault(a => a.AddressId == id) ?? throw new KeyNotFoundException("Address not found");
        all.ForEach(a => a.IsDefault = a.AddressId == id);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId, int id)
    {
        var all = await db.Addresses.Where(a => a.UserId == userId).OrderBy(a => a.AddressId).ToListAsync();
        var address = all.FirstOrDefault(a => a.AddressId == id) ?? throw new KeyNotFoundException("Address not found");

        db.Addresses.Remove(address);
        if (address.IsDefault)   // promote another address so there is always a default
            all.FirstOrDefault(a => a.AddressId != id)?.SetDefault();
        await db.SaveChangesAsync();
    }

    private static void Apply(Address a, SaveAddressDto d)
    {
        a.FullName = d.FullName.Trim();
        a.PhoneNumber = d.PhoneNumber.Trim();
        a.AddressLine1 = d.AddressLine1.Trim();
        a.AddressLine2 = d.AddressLine2?.Trim();
        a.City = d.City.Trim();
        a.State = d.State.Trim();
        a.PostalCode = d.PostalCode.Trim();
        a.Country = d.Country.Trim();
    }

    private static AddressDto ToDto(Address a) => new()
    {
        AddressId = a.AddressId,
        FullName = a.FullName,
        PhoneNumber = a.PhoneNumber,
        AddressLine1 = a.AddressLine1,
        AddressLine2 = a.AddressLine2,
        City = a.City,
        State = a.State,
        PostalCode = a.PostalCode,
        Country = a.Country,
        IsDefault = a.IsDefault
    };
}

internal static class AddressExtensions
{
    public static void SetDefault(this Address a) => a.IsDefault = true;
}