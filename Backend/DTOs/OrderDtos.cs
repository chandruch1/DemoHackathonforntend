namespace RetailOrderingApi.DTOs;

public class CheckoutRequest
{
    public int AddressId { get; set; }
    public string? DeliveryInstructions { get; set; }
    public string PaymentMethod { get; set; } = "CashOnDelivery"; // "Razorpay" | "CashOnDelivery"
}

public class PaymentInitiationDto
{
    public string Provider { get; set; } = "Razorpay";
    public string ProviderOrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string RazorpayKeyId { get; set; } = string.Empty;
}

public class CheckoutResponse
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "INR";
    public string PaymentStatus { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public PaymentInitiationDto? Payment { get; set; }
}

public class OrderListItemDto
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class AddressSnapshotDto
{
    public string RecipientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}

public class OrderStatusHistoryDto
{
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAtUtc { get; set; }
    public string ChangedByName { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class OrderDetailsDto
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
    public AddressSnapshotDto DeliveryAddress { get; set; } = null!;
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public List<OrderStatusHistoryDto> StatusHistory { get; set; } = new();
}

public class UpdateOrderStatusRequest
{
    public string NewStatus { get; set; } = string.Empty;
    public string? Note { get; set; }
}
