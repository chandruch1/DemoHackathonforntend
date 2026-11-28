using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private string GetCustomerId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var result = await _cartService.GetCartAsync(GetCustomerId());
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemRequest request)
    {
        var result = await _cartService.AddItemToCartAsync(GetCustomerId(), request);
        return Ok(result);
    }

    [HttpPut("items/{cartItemId:int}")]
    public async Task<ActionResult<CartDto>> UpdateItem(int cartItemId, [FromBody] UpdateCartItemRequest request)
    {
        var result = await _cartService.UpdateCartItemAsync(GetCustomerId(), cartItemId, request);
        return Ok(result);
    }

    [HttpDelete("items/{cartItemId:int}")]
    public async Task<ActionResult<CartDto>> RemoveItem(int cartItemId)
    {
        var result = await _cartService.RemoveCartItemAsync(GetCustomerId(), cartItemId);
        return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync(GetCustomerId());
        return NoContent();
    }
}
