using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/checkout")]
public class CheckoutController : ControllerBase
{
    private readonly IOrderService _orderService;

    public CheckoutController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<CheckoutResponse>> Checkout([FromBody] CheckoutRequest request)
    {
        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _orderService.CheckoutAsync(customerId, request);
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/v1/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IPaymentService _paymentService;

    public OrdersController(IOrderService orderService, IPaymentService paymentService)
    {
        _orderService = orderService;
        _paymentService = paymentService;
    }

    private string GetCustomerId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<OrderListItemDto>>> GetMyOrders()
    {
        var result = await _orderService.GetMyOrdersAsync(GetCustomerId());
        return Ok(result);
    }

    [HttpGet("my/{orderId:int}")]
    public async Task<ActionResult<OrderDetailsDto>> GetMyOrderById(int orderId)
    {
        var result = await _orderService.GetMyOrderByIdAsync(GetCustomerId(), orderId);
        return Ok(result);
    }

    [HttpGet("{orderId:int}/payment")]
    public async Task<ActionResult<PaymentResultDto>> GetOrderPayment(int orderId)
    {
        var result = await _paymentService.GetOrderPaymentAsync(orderId, GetCustomerId());
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("razorpay/verify")]
    public async Task<ActionResult<PaymentResultDto>> VerifyRazorpay([FromBody] RazorpayVerifyRequest request)
    {
        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _paymentService.VerifyRazorpayPaymentAsync(customerId, request);
        return Ok(result);
    }
}
