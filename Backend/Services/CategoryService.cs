using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync(bool activeOnly = false)
    {
        var query = _context.Categories.AsQueryable();
        if (activeOnly)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query
            .Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.CategoryId == id);

        if (category == null)
        {
            throw new KeyNotFoundException($"Category with id {id} not found.");
        }

        return new CategoryDto
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            ProductCount = category.Products.Count
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryUpsertDto dto)
    {
        var name = dto.Name.Trim();
        var exists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == name.ToLower());
        if (exists)
        {
            throw new BadHttpRequestException($"Category with name '{name}' already exists.");
        }

        var category = new Category
        {
            Name = name,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            ProductCount = 0
        };
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, CategoryUpsertDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            throw new KeyNotFoundException($"Category with id {id} not found.");
        }

        var name = dto.Name.Trim();
        var exists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == name.ToLower() && c.CategoryId != id);
        if (exists)
        {
            throw new BadHttpRequestException($"Another category with name '{name}' already exists.");
        }

        category.Name = name;
        category.Description = dto.Description;
        category.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        var count = await _context.Products.CountAsync(p => p.CategoryId == id);

        return new CategoryDto
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            ProductCount = count
        };
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.CategoryId == id);
        if (category == null)
        {
            throw new KeyNotFoundException($"Category with id {id} not found.");
        }

        if (category.Products.Any())
        {
            throw new BadHttpRequestException("Cannot delete category because it contains products. Reassign or delete products first.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}
