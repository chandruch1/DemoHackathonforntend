using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Data;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public OrderService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<CheckoutResponse> CheckoutAsync(string customerId, CheckoutRequest request)
    {
        // 1. Validate Address
        var address = await _context.Addresses
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.AddressId == request.AddressId && a.CustomerId == customerId);

        if (address == null)
        {
            throw new BadHttpRequestException("Delivery address was not found or does not belong to you.");
        }

        // 2. Fetch User Cart
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Inventory)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null || !cart.Items.Any())
        {
            throw new BadHttpRequestException("Your shopping cart is empty.");
        }

        // 3. Begin Transaction
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
            decimal subtotal = 0;

            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerId = customerId,
                RecipientName = address.RecipientName,
                Phone = address.Phone,
                AddressLine1 = address.AddressLine1,
                AddressLine2 = address.AddressLine2,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                DeliveryInstructions = request.DeliveryInstructions,
                OrderStatus = string.Equals(request.PaymentMethod, PaymentProviders.Razorpay, StringComparison.OrdinalIgnoreCase)
                    ? Models.OrderStatus.PendingPayment
                    : Models.OrderStatus.Placed,
                PaymentStatus = Models.PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            var orderItems = new List<OrderItem>();

            foreach (var cartItem in cart.Items)
            {
                // Reload product & inventory with lock
                var product = await _context.Products
                    .Include(p => p.Inventory)
                    .FirstOrDefaultAsync(p => p.ProductId == cartItem.ProductId);

                if (product == null || !product.IsActive)
                {
                    throw new BadHttpRequestException($"Product with ID {cartItem.ProductId} is no longer available.");
                }

                var available = product.Inventory?.AvailableQuantity ?? 0;
                if (available < cartItem.Quantity)
                {
                    throw new BadHttpRequestException($"Insufficient stock for '{product.Name}'. Available: {available}, requested: {cartItem.Quantity}.");
                }

                // Deduct stock
                product.Inventory!.AvailableQuantity -= cartItem.Quantity;
                product.Inventory.UpdatedAt = DateTime.UtcNow;

                var lineTotal = product.Price * cartItem.Quantity;
                subtotal += lineTotal;

                orderItems.Add(new OrderItem
                {
                    Order = order,
                    ProductId = product.ProductId,
                    ProductNameSnapshot = product.Name,
                    ImageUrlSnapshot = product.ImageUrl,
                    UnitPrice = product.Price,
                    Quantity = cartItem.Quantity,
                    LineTotal = lineTotal
                });
            }

            var deliveryFee = subtotal >= 500 ? 0m : 40m;
            var totalAmount = subtotal + deliveryFee;

            order.Subtotal = subtotal;
            order.DeliveryFee = deliveryFee;
            order.TotalAmount = totalAmount;
            order.Items = orderItems;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Setup Payment Record
            var isRazorpay = string.Equals(request.PaymentMethod, PaymentProviders.Razorpay, StringComparison.OrdinalIgnoreCase);
            var providerOrderId = isRazorpay ? $"order_rzp_{order.OrderId}_{DateTime.UtcNow.Ticks}" : null;

            var payment = new Payment
            {
                OrderId = order.OrderId,
                Provider = isRazorpay ? PaymentProviders.Razorpay : PaymentProviders.CashOnDelivery,
                ProviderOrderId = providerOrderId,
                Amount = totalAmount,
                Currency = "INR",
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            // Add OrderStatusHistory
            var statusHistory = new OrderStatusHistory
            {
                OrderId = order.OrderId,
                OldStatus = null,
                NewStatus = order.OrderStatus,
                ChangedByUserId = customerId,
                ChangedByName = address.RecipientName,
                Note = isRazorpay ? "Order initiated with Razorpay payment" : "Order placed with Cash on Delivery",
                ChangedAt = DateTime.UtcNow
            };
            _context.OrderStatusHistories.Add(statusHistory);

            // Clear Cart
            _context.CartItems.RemoveRange(cart.Items);
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            PaymentInitiationDto? paymentInitiation = null;
            if (isRazorpay)
            {
                paymentInitiation = new PaymentInitiationDto
                {
                    Provider = "Razorpay",
                    ProviderOrderId = providerOrderId!,
                    Amount = totalAmount,
                    Currency = "INR",
                    RazorpayKeyId = _config["Razorpay:KeyId"] ?? "rzp_test_1DP5mmOlF5G5ag"
                };
            }

            return new CheckoutResponse
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                Subtotal = order.Subtotal,
                DeliveryFee = order.DeliveryFee,
                TotalAmount = order.TotalAmount,
                Currency = "INR",
                PaymentStatus = order.PaymentStatus,
                OrderStatus = order.OrderStatus,
                Payment = paymentInitiation
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<OrderListItemDto>> GetMyOrdersAsync(string customerId)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
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
    }

    public async Task<OrderDetailsDto> GetMyOrderByIdAsync(string customerId, int orderId)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.StatusHistories)
            .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customerId);

        if (order == null)
        {
            throw new KeyNotFoundException($"Order with id {orderId} was not found.");
        }

        return MapToOrderDetailsDto(order);
    }

    public async Task<IEnumerable<OrderListItemDto>> GetAllOrdersAsync(string? status = null, string? search = null)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.OrderStatus.ToLower() == status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(term) ||
                                     o.RecipientName.ToLower().Contains(term) ||
                                     o.Phone.ToLower().Contains(term));
        }

        return await query
            .OrderByDescending(o => o.CreatedAt)
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
    }

    public async Task<OrderDetailsDto> GetAdminOrderByIdAsync(int orderId)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.StatusHistories)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            throw new KeyNotFoundException($"Order with id {orderId} was not found.");
        }

        return MapToOrderDetailsDto(order);
    }

    public async Task<OrderDetailsDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, string adminUserId, string adminName)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistories)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            throw new KeyNotFoundException($"Order with id {orderId} was not found.");
        }

        var newStatus = request.NewStatus.Trim();
        if (!OrderStatus.AllStatuses.Contains(newStatus, StringComparer.OrdinalIgnoreCase))
        {
            throw new BadHttpRequestException($"Invalid order status '{newStatus}'.");
        }

        var oldStatus = order.OrderStatus;
        if (string.Equals(oldStatus, newStatus, StringComparison.OrdinalIgnoreCase))
        {
            return MapToOrderDetailsDto(order);
        }

        // If order was cancelled from non-cancelled status, restore stock
        if (string.Equals(newStatus, OrderStatus.Cancelled, StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(oldStatus, OrderStatus.Cancelled, StringComparison.OrdinalIgnoreCase))
        {
            foreach (var item in order.Items)
            {
                var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.ProductId == item.ProductId);
                if (inventory != null)
                {
                    inventory.AvailableQuantity += item.Quantity;
                    inventory.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        // If marked Delivered on COD, mark payment Paid
        if (string.Equals(newStatus, OrderStatus.Delivered, StringComparison.OrdinalIgnoreCase) &&
            order.Payment != null &&
            string.Equals(order.Payment.Provider, PaymentProviders.CashOnDelivery, StringComparison.OrdinalIgnoreCase))
        {
            order.Payment.Status = PaymentStatus.Paid;
            order.Payment.PaidAt = DateTime.UtcNow;
            order.PaymentStatus = PaymentStatus.Paid;
        }

        order.OrderStatus = newStatus;

        var history = new OrderStatusHistory
        {
            OrderId = order.OrderId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedByUserId = adminUserId,
            ChangedByName = adminName,
            Note = request.Note ?? $"Status updated by {adminName}",
            ChangedAt = DateTime.UtcNow
        };

        _context.OrderStatusHistories.Add(history);
        await _context.SaveChangesAsync();

        return MapToOrderDetailsDto(order);
    }

    private static OrderDetailsDto MapToOrderDetailsDto(Order order)
    {
        return new OrderDetailsDto
        {
            OrderId = order.OrderId,
            OrderNumber = order.OrderNumber,
            CustomerName = order.RecipientName,
            DeliveryAddress = new AddressSnapshotDto
            {
                RecipientName = order.RecipientName,
                Phone = order.Phone,
                AddressLine1 = order.AddressLine1,
                AddressLine2 = order.AddressLine2,
                City = order.City,
                State = order.State,
                PostalCode = order.PostalCode
            },
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductNameSnapshot,
                ImageUrl = i.ImageUrlSnapshot,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                LineTotal = i.LineTotal
            }).ToList(),
            Subtotal = order.Subtotal,
            DeliveryFee = order.DeliveryFee,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus,
            PaymentStatus = order.PaymentStatus,
            CreatedAtUtc = order.CreatedAt,
            StatusHistory = order.StatusHistories
                .OrderBy(h => h.ChangedAt)
                .Select(h => new OrderStatusHistoryDto
                {
                    OldStatus = h.OldStatus,
                    NewStatus = h.NewStatus,
                    ChangedByName = h.ChangedByName ?? "System",
                    ChangedAtUtc = h.ChangedAt,
                    Note = h.Note
                }).ToList()
        };
    }
}
