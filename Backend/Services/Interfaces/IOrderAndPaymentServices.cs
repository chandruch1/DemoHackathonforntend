using RetailOrderingApi.DTOs;

namespace RetailOrderingApi.Services.Interfaces;

public interface IOrderService
{
    Task<CheckoutResponse> CheckoutAsync(string customerId, CheckoutRequest request);
    Task<IEnumerable<OrderListItemDto>> GetMyOrdersAsync(string customerId);
    Task<OrderDetailsDto> GetMyOrderByIdAsync(string customerId, int orderId);

    Task<IEnumerable<OrderListItemDto>> GetAllOrdersAsync(string? status = null, string? search = null);
    Task<OrderDetailsDto> GetAdminOrderByIdAsync(int orderId);
    Task<OrderDetailsDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, string adminUserId, string adminName);
}

public interface IPaymentService
{
    Task<PaymentResultDto> VerifyRazorpayPaymentAsync(string customerId, RazorpayVerifyRequest request);
    Task<PaymentResultDto> GetOrderPaymentAsync(int orderId, string? customerId = null);
}

public interface IDashboardService
{
    Task<DashboardMetricsDto> GetDashboardMetricsAsync();
}
