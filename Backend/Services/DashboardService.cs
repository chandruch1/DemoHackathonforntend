using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
    {
        var totalProducts = await _context.Products.CountAsync();
        var totalCategories = await _context.Categories.CountAsync();
        var lowStock = await _context.Inventories.CountAsync(i => i.AvailableQuantity <= 10);
        var totalOrders = await _context.Orders.CountAsync();
        var pendingOrders = await _context.Orders.CountAsync(o => o.OrderStatus == OrderStatus.Placed ||
                                                                   o.OrderStatus == OrderStatus.PendingPayment ||
                                                                   o.OrderStatus == OrderStatus.Processing);

        var totalRevenue = await _context.Orders
            .Where(o => o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        var recentOrders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new OrderListItemDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                CustomerName = o.RecipientName,
                CreatedAtUtc = o.CreatedAt,
                ItemCount = o.Items.Sum(i => i.Quantity),
                TotalAmount = o.TotalAmount,
                OrderStatus = o.OrderStatus,
                PaymentStatus = o.PaymentStatus
            })
            .ToListAsync();

        return new DashboardMetricsDto
        {
            TotalProducts = totalProducts,
            Categories = totalCategories,
            LowStock = lowStock,
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            TotalRevenue = totalRevenue,
            RecentOrders = recentOrders
        };
    }
}
