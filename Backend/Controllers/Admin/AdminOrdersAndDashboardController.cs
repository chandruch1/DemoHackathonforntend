using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers.Admin;

[Authorize(Roles = Roles.Admin)]
[ApiController]
[Route("api/v1/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderListItemDto>>> GetOrders(
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var result = await _orderService.GetAllOrdersAsync(status, search);
        return Ok(result);
    }

    [HttpGet("{orderId:int}")]
    public async Task<ActionResult<OrderDetailsDto>> GetOrderById(int orderId)
    {
        var result = await _orderService.GetAdminOrderByIdAsync(orderId);
        return Ok(result);
    }

    [HttpPatch("{orderId:int}/status")]
    public async Task<ActionResult<OrderDetailsDto>> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
    {
        var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Admin";
        var adminName = User.FindFirstValue("FullName") ?? User.Identity?.Name ?? "Administrator";

        var result = await _orderService.UpdateOrderStatusAsync(orderId, request, adminUserId, adminName);
        return Ok(result);
    }
}

[Authorize(Roles = Roles.Admin)]
[ApiController]
[Route("api/v1/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public AdminDashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardMetricsDto>> GetDashboardMetrics()
    {
        var result = await _dashboardService.GetDashboardMetricsAsync();
        return Ok(result);
    }
}
