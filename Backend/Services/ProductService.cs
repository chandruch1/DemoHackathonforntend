using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<ProductListItemDto>> GetProductsAsync(
        int page = 1,
        int pageSize = 12,
        string? search = null,
        int? categoryId = null,
        int? brandId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? sortBy = null)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 12 : pageSize;

        // Customer catalog: active products only
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Inventory)
            .Where(p => p.IsActive && p.Category != null && p.Category.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) ||
                                     p.Description.ToLower().Contains(term) ||
                                     (p.Category != null && p.Category.Name.ToLower().Contains(term)));
        }

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (brandId.HasValue && brandId.Value > 0)
        {
            query = query.Where(p => p.BrandId == brandId.Value);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        query = sortBy?.ToLower() switch
        {
            "price_asc" or "price-asc" or "lowest" => query.OrderBy(p => p.Price),
            "price_desc" or "price-desc" or "highest" => query.OrderByDescending(p => p.Price),
            "name_desc" or "name-desc" => query.OrderByDescending(p => p.Name),
            "name_asc" or "name-asc" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemDto
            {
                ProductId = p.ProductId,
                Name = p.Name,
                ShortDescription = p.Description.Length > 80 ? p.Description.Substring(0, 77) + "..." : p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                BrandName = p.Brand != null ? p.Brand.Name : null,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                AvailableQuantity = p.Inventory != null ? p.Inventory.AvailableQuantity : 0
            })
            .ToListAsync();

        return new PagedResponse<ProductListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ProductDetailsDto> GetProductByIdAsync(int productId)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.ProductId == productId && p.IsActive);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with id {productId} was not found.");
        }

        return new ProductDetailsDto
        {
            ProductId = product.ProductId,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            BrandId = product.BrandId,
            BrandName = product.Brand?.Name,
            PackagingInfo = product.PackagingInfo,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            AvailableQuantity = product.Inventory?.AvailableQuantity ?? 0,
            IsActive = product.IsActive,
            CreatedAtUtc = product.CreatedAt
        };
    }

    public async Task<IEnumerable<ProductDetailsDto>> GetAdminProductsAsync(string? search = null, int? categoryId = null, int? brandId = null)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Inventory)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) ||
                                     p.Description.ToLower().Contains(term));
        }

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (brandId.HasValue && brandId.Value > 0)
        {
            query = query.Where(p => p.BrandId == brandId.Value);
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDetailsDto
            {
                ProductId = p.ProductId,
                Name = p.Name,
                Description = p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                BrandId = p.BrandId,
                BrandName = p.Brand != null ? p.Brand.Name : null,
                PackagingInfo = p.PackagingInfo,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                AvailableQuantity = p.Inventory != null ? p.Inventory.AvailableQuantity : 0,
                IsActive = p.IsActive,
                CreatedAtUtc = p.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ProductDetailsDto> GetAdminProductByIdAsync(int productId)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.ProductId == productId);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with id {productId} was not found.");
        }

        return new ProductDetailsDto
        {
            ProductId = product.ProductId,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            BrandId = product.BrandId,
            BrandName = product.Brand?.Name,
            PackagingInfo = product.PackagingInfo,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            AvailableQuantity = product.Inventory?.AvailableQuantity ?? 0,
            IsActive = product.IsActive,
            CreatedAtUtc = product.CreatedAt
        };
    }

    public async Task<ProductDetailsDto> CreateProductAsync(AdminProductUpsertDto dto)
    {
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
        {
            throw new BadHttpRequestException($"Category with id {dto.CategoryId} does not exist.");
        }

        if (dto.BrandId.HasValue && dto.BrandId.Value > 0)
        {
            var brandExists = await _context.Brands.AnyAsync(b => b.BrandId == dto.BrandId.Value);
            if (!brandExists)
            {
                throw new BadHttpRequestException($"Brand with id {dto.BrandId.Value} does not exist.");
            }
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            BrandId = dto.BrandId.HasValue && dto.BrandId.Value > 0 ? dto.BrandId.Value : null,
            PackagingInfo = dto.PackagingInfo,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            Inventory = new Inventory
            {
                AvailableQuantity = Math.Max(0, dto.AvailableQuantity),
                UpdatedAt = DateTime.UtcNow
            }
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return await GetAdminProductByIdAsync(product.ProductId);
    }

    public async Task<ProductDetailsDto> UpdateProductAsync(int id, AdminProductUpsertDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with id {id} was not found.");
        }

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
        {
            throw new BadHttpRequestException($"Category with id {dto.CategoryId} does not exist.");
        }

        product.Name = dto.Name.Trim();
        product.Description = dto.Description;
        product.CategoryId = dto.CategoryId;
        product.BrandId = dto.BrandId.HasValue && dto.BrandId.Value > 0 ? dto.BrandId.Value : null;
        product.PackagingInfo = dto.PackagingInfo;
        product.Price = dto.Price;
        product.ImageUrl = dto.ImageUrl;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        if (product.Inventory == null)
        {
            product.Inventory = new Inventory
            {
                ProductId = product.ProductId,
                AvailableQuantity = Math.Max(0, dto.AvailableQuantity),
                UpdatedAt = DateTime.UtcNow
            };
        }
        else
        {
            product.Inventory.AvailableQuantity = Math.Max(0, dto.AvailableQuantity);
            product.Inventory.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return await GetAdminProductByIdAsync(id);
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with id {id} was not found.");
        }

        var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            // Soft-deactivate if historical orders reference it
            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return;
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

    public async Task ToggleActiveStatusAsync(int id, bool isActive)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with id {id} was not found.");
        }

        product.IsActive = isActive;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
