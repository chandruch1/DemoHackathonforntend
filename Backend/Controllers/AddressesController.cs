using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/customers/me/addresses")]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    private string GetCustomerId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AddressDto>>> GetAddresses()
    {
        var result = await _addressService.GetAddressesAsync(GetCustomerId());
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<AddressDto>> CreateAddress([FromBody] CreateAddressRequest request)
    {
        var result = await _addressService.CreateAddressAsync(GetCustomerId(), request);
        return CreatedAtAction(nameof(GetAddresses), new { id = result.AddressId }, result);
    }

    [HttpPut("{addressId:int}")]
    public async Task<ActionResult<AddressDto>> UpdateAddress(int addressId, [FromBody] CreateAddressRequest request)
    {
        var result = await _addressService.UpdateAddressAsync(GetCustomerId(), addressId, request);
        return Ok(result);
    }

    [HttpDelete("{addressId:int}")]
    public async Task<IActionResult> DeleteAddress(int addressId)
    {
        await _addressService.DeleteAddressAsync(GetCustomerId(), addressId);
        return NoContent();
    }

    [HttpPatch("{addressId:int}/default")]
    public async Task<IActionResult> SetDefaultAddress(int addressId)
    {
        await _addressService.SetDefaultAddressAsync(GetCustomerId(), addressId);
        return NoContent();
    }
}
