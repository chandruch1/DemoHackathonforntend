using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    private async Task<Cart> GetOrCreateUserCartAsync(string customerId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Inventory)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            cart = new Cart
            {
                CustomerId = customerId,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    public async Task<CartDto> GetCartAsync(string customerId)
    {
        var cart = await GetOrCreateUserCartAsync(customerId);

        var items = cart.Items
            .Where(i => i.Product != null && i.Product.IsActive)
            .Select(i => new CartItemDto
            {
                CartItemId = i.CartItemId,
                ProductId = i.ProductId,
                ProductName = i.Product!.Name,
                ImageUrl = i.Product.ImageUrl,
                UnitPrice = i.Product.Price,
                Quantity = i.Quantity,
                LineTotal = i.Product.Price * i.Quantity,
                AvailableQuantity = i.Product.Inventory?.AvailableQuantity ?? 0
            })
            .ToList();

        return new CartDto
        {
            CartId = cart.CartId,
            Items = items,
            ItemCount = items.Sum(i => i.Quantity),
            Subtotal = items.Sum(i => i.LineTotal),
            UpdatedAtUtc = cart.UpdatedAt
        };
    }

    public async Task<CartDto> AddItemToCartAsync(string customerId, AddCartItemRequest request)
    {
        if (request.Quantity < 1)
        {
            throw new BadHttpRequestException("Item quantity must be at least 1.");
        }

        var product = await _context.Products
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.ProductId == request.ProductId && p.IsActive);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with id {request.ProductId} was not found.");
        }

        var available = product.Inventory?.AvailableQuantity ?? 0;
        if (available <= 0)
        {
            throw new BadHttpRequestException($"Product '{product.Name}' is out of stock.");
        }

        var cart = await GetOrCreateUserCartAsync(customerId);
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            var targetQty = existingItem.Quantity + request.Quantity;
            if (targetQty > available)
            {
                throw new BadHttpRequestException($"Only {available} units available in stock. Cannot add {request.Quantity} more.");
            }
            existingItem.Quantity = targetQty;
        }
        else
        {
            if (request.Quantity > available)
            {
                throw new BadHttpRequestException($"Only {available} units available in stock.");
            }

            var newItem = new CartItem
            {
                CartId = cart.CartId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                AddedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(newItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetCartAsync(customerId);
    }

    public async Task<CartDto> UpdateCartItemAsync(string customerId, int cartItemId, UpdateCartItemRequest request)
    {
        if (request.Quantity < 1)
        {
            throw new BadHttpRequestException("Quantity must be at least 1.");
        }

        var cart = await GetOrCreateUserCartAsync(customerId);
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == cartItemId);

        if (item == null)
        {
            throw new KeyNotFoundException($"Cart item with id {cartItemId} was not found in your cart.");
        }

        var available = item.Product?.Inventory?.AvailableQuantity ?? 0;
        if (request.Quantity > available)
        {
            throw new BadHttpRequestException($"Requested quantity ({request.Quantity}) exceeds available stock ({available}).");
        }

        item.Quantity = request.Quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetCartAsync(customerId);
    }

    public async Task<CartDto> RemoveCartItemAsync(string customerId, int cartItemId)
    {
        var cart = await GetOrCreateUserCartAsync(customerId);
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == cartItemId);

        if (item != null)
        {
            _context.CartItems.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return await GetCartAsync(customerId);
    }

    public async Task ClearCartAsync(string customerId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart != null && cart.Items.Any())
        {
            _context.CartItems.RemoveRange(cart.Items);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
