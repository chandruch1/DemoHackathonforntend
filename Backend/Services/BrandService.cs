using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class BrandService : IBrandService
{
    private readonly AppDbContext _context;

    public BrandService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BrandDto>> GetBrandsAsync(bool activeOnly = false)
    {
        var query = _context.Brands.AsQueryable();
        if (activeOnly)
        {
            query = query.Where(b => b.IsActive);
        }

        return await query
            .Select(b => new BrandDto
            {
                BrandId = b.BrandId,
                Name = b.Name,
                Description = b.Description,
                IsActive = b.IsActive,
                ProductCount = b.Products.Count
            })
            .ToListAsync();
    }

    public async Task<BrandDto> GetBrandByIdAsync(int id)
    {
        var brand = await _context.Brands
            .Include(b => b.Products)
            .FirstOrDefaultAsync(b => b.BrandId == id);

        if (brand == null)
        {
            throw new KeyNotFoundException($"Brand with id {id} not found.");
        }

        return new BrandDto
        {
            BrandId = brand.BrandId,
            Name = brand.Name,
            Description = brand.Description,
            IsActive = brand.IsActive,
            ProductCount = brand.Products.Count
        };
    }

    public async Task<BrandDto> CreateBrandAsync(BrandUpsertDto dto)
    {
        var name = dto.Name.Trim();
        var exists = await _context.Brands.AnyAsync(b => b.Name.ToLower() == name.ToLower());
        if (exists)
        {
            throw new BadHttpRequestException($"Brand with name '{name}' already exists.");
        }

        var brand = new Brand
        {
            Name = name,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Brands.Add(brand);
        await _context.SaveChangesAsync();

        return new BrandDto
        {
            BrandId = brand.BrandId,
            Name = brand.Name,
            Description = brand.Description,
            IsActive = brand.IsActive,
            ProductCount = 0
        };
    }

    public async Task<BrandDto> UpdateBrandAsync(int id, BrandUpsertDto dto)
    {
        var brand = await _context.Brands.FindAsync(id);
        if (brand == null)
        {
            throw new KeyNotFoundException($"Brand with id {id} not found.");
        }

        var name = dto.Name.Trim();
        var exists = await _context.Brands.AnyAsync(b => b.Name.ToLower() == name.ToLower() && b.BrandId != id);
        if (exists)
        {
            throw new BadHttpRequestException($"Another brand with name '{name}' already exists.");
        }

        brand.Name = name;
        brand.Description = dto.Description;
        brand.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        var count = await _context.Products.CountAsync(p => p.BrandId == id);

        return new BrandDto
        {
            BrandId = brand.BrandId,
            Name = brand.Name,
            Description = brand.Description,
            IsActive = brand.IsActive,
            ProductCount = count
        };
    }

    public async Task DeleteBrandAsync(int id)
    {
        var brand = await _context.Brands.Include(b => b.Products).FirstOrDefaultAsync(b => b.BrandId == id);
        if (brand == null)
        {
            throw new KeyNotFoundException($"Brand with id {id} not found.");
        }

        if (brand.Products.Any())
        {
            throw new BadHttpRequestException("Cannot delete brand because it is referenced by existing products.");
        }

        _context.Brands.Remove(brand);
        await _context.SaveChangesAsync();
    }
}
