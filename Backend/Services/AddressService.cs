using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class AddressService : IAddressService
{
    private readonly AppDbContext _context;

    public AddressService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AddressDto>> GetAddressesAsync(string customerId)
    {
        return await _context.Addresses
            .AsNoTracking()
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.AddressId)
            .Select(a => new AddressDto
            {
                AddressId = a.AddressId,
                RecipientName = a.RecipientName,
                Phone = a.Phone,
                AddressLine1 = a.AddressLine1,
                AddressLine2 = a.AddressLine2,
                City = a.City,
                State = a.State,
                PostalCode = a.PostalCode,
                IsDefault = a.IsDefault
            })
            .ToListAsync();
    }

    public async Task<AddressDto> CreateAddressAsync(string customerId, CreateAddressRequest request)
    {
        var hasExisting = await _context.Addresses.AnyAsync(a => a.CustomerId == customerId);

        var isDefault = request.IsDefault || !hasExisting;

        if (isDefault && hasExisting)
        {
            var existingDefaults = await _context.Addresses
                .Where(a => a.CustomerId == customerId && a.IsDefault)
                .ToListAsync();

            foreach (var d in existingDefaults)
            {
                d.IsDefault = false;
            }
        }

        var address = new Address
        {
            CustomerId = customerId,
            RecipientName = request.RecipientName.Trim(),
            Phone = request.Phone.Trim(),
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = request.AddressLine2?.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            PostalCode = request.PostalCode.Trim(),
            IsDefault = isDefault
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return new AddressDto
        {
            AddressId = address.AddressId,
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            IsDefault = address.IsDefault
        };
    }

    public async Task<AddressDto> UpdateAddressAsync(string customerId, int addressId, CreateAddressRequest request)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressId == addressId && a.CustomerId == customerId);

        if (address == null)
        {
            throw new KeyNotFoundException($"Address with id {addressId} not found.");
        }

        if (request.IsDefault && !address.IsDefault)
        {
            var otherDefaults = await _context.Addresses
                .Where(a => a.CustomerId == customerId && a.AddressId != addressId && a.IsDefault)
                .ToListAsync();

            foreach (var d in otherDefaults)
            {
                d.IsDefault = false;
            }
        }

        address.RecipientName = request.RecipientName.Trim();
        address.Phone = request.Phone.Trim();
        address.AddressLine1 = request.AddressLine1.Trim();
        address.AddressLine2 = request.AddressLine2?.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.PostalCode = request.PostalCode.Trim();
        address.IsDefault = request.IsDefault;

        await _context.SaveChangesAsync();

        return new AddressDto
        {
            AddressId = address.AddressId,
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            IsDefault = address.IsDefault
        };
    }

    public async Task DeleteAddressAsync(string customerId, int addressId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressId == addressId && a.CustomerId == customerId);

        if (address == null)
        {
            throw new KeyNotFoundException($"Address with id {addressId} not found.");
        }

        var wasDefault = address.IsDefault;
        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        if (wasDefault)
        {
            var firstRemaining = await _context.Addresses
                .Where(a => a.CustomerId == customerId)
                .FirstOrDefaultAsync();

            if (firstRemaining != null)
            {
                firstRemaining.IsDefault = true;
                await _context.SaveChangesAsync();
            }
        }
    }

    public async Task SetDefaultAddressAsync(string customerId, int addressId)
    {
        var addresses = await _context.Addresses
            .Where(a => a.CustomerId == customerId)
            .ToListAsync();

        var target = addresses.FirstOrDefault(a => a.AddressId == addressId);
        if (target == null)
        {
            throw new KeyNotFoundException($"Address with id {addressId} not found.");
        }

        foreach (var a in addresses)
        {
            a.IsDefault = a.AddressId == addressId;
        }

        await _context.SaveChangesAsync();
    }
}
