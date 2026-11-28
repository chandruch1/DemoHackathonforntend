using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryDto>> GetInventoryListAsync(string? search = null)
    {
        var query = _context.Inventories
            .Include(i => i.Product)
                .ThenInclude(p => p!.Category)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(i => i.Product != null && i.Product.Name.ToLower().Contains(term));
        }

        return await query
            .OrderBy(i => i.AvailableQuantity)
            .Select(i => new InventoryDto
            {
                InventoryId = i.InventoryId,
                ProductId = i.ProductId,
                ProductName = i.Product != null ? i.Product.Name : string.Empty,
                CategoryName = i.Product != null && i.Product.Category != null ? i.Product.Category.Name : string.Empty,
                AvailableQuantity = i.AvailableQuantity,
                UpdatedAtUtc = i.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<InventoryDto> GetProductInventoryAsync(int productId)
    {
        var inventory = await _context.Inventories
            .Include(i => i.Product)
                .ThenInclude(p => p!.Category)
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        if (inventory == null)
        {
            // Auto-create inventory if product exists
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.ProductId == productId);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product with id {productId} was not found.");
            }

            inventory = new Inventory
            {
                ProductId = productId,
                AvailableQuantity = 0,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            return new InventoryDto
            {
                InventoryId = inventory.InventoryId,
                ProductId = inventory.ProductId,
                ProductName = product.Name,
                CategoryName = product.Category?.Name ?? string.Empty,
                AvailableQuantity = 0,
                UpdatedAtUtc = inventory.UpdatedAt
            };
        }

        return new InventoryDto
        {
            InventoryId = inventory.InventoryId,
            ProductId = inventory.ProductId,
            ProductName = inventory.Product?.Name ?? string.Empty,
            CategoryName = inventory.Product?.Category?.Name ?? string.Empty,
            AvailableQuantity = inventory.AvailableQuantity,
            UpdatedAtUtc = inventory.UpdatedAt
        };
    }

    public async Task<InventoryDto> UpdateInventoryAsync(int productId, UpdateInventoryDto dto)
    {
        var inventory = await _context.Inventories
            .Include(i => i.Product)
                .ThenInclude(p => p!.Category)
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        if (inventory == null)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.ProductId == productId);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product with id {productId} was not found.");
            }

            inventory = new Inventory
            {
                ProductId = productId,
                AvailableQuantity = 0,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Inventories.Add(inventory);
        }

        if (string.Equals(dto.ChangeType, "set", StringComparison.OrdinalIgnoreCase))
        {
            if (dto.StockChange < 0)
            {
                throw new BadHttpRequestException("Available quantity cannot be negative.");
            }
            inventory.AvailableQuantity = dto.StockChange;
        }
        else if (string.Equals(dto.ChangeType, "reduce", StringComparison.OrdinalIgnoreCase))
        {
            if (dto.StockChange > inventory.AvailableQuantity)
            {
                throw new BadHttpRequestException("Cannot reduce stock below 0.");
            }
            inventory.AvailableQuantity -= dto.StockChange;
        }
        else // default "add"
        {
            if (dto.StockChange < 0)
            {
                throw new BadHttpRequestException("Stock addition must be a positive number.");
            }
            inventory.AvailableQuantity += dto.StockChange;
        }

        inventory.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new InventoryDto
        {
            InventoryId = inventory.InventoryId,
            ProductId = inventory.ProductId,
            ProductName = inventory.Product?.Name ?? string.Empty,
            CategoryName = inventory.Product?.Category?.Name ?? string.Empty,
            AvailableQuantity = inventory.AvailableQuantity,
            UpdatedAtUtc = inventory.UpdatedAt
        };
    }
}
