namespace RetailOrderingApi.DTOs;

public class RazorpayVerifyRequest
{
    public int OrderId { get; set; }
    public string RazorpayOrderId { get; set; } = string.Empty;
    public string RazorpayPaymentId { get; set; } = string.Empty;
    public string RazorpaySignature { get; set; } = string.Empty;
}

public class PaymentResultDto
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class DashboardMetricsDto
{
    public int TotalProducts { get; set; }
    public int Categories { get; set; }
    public int LowStock { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<OrderListItemDto> RecentOrders { get; set; } = new();
}
