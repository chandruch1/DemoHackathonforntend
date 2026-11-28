using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers.Admin;

[Authorize(Roles = Roles.Admin)]
[ApiController]
[Route("api/v1/admin/products")]
public class AdminProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public AdminProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDetailsDto>>> GetProducts(
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null)
    {
        var result = await _productService.GetAdminProductsAsync(search, categoryId, brandId);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailsDto>> GetProductById(int id)
    {
        var result = await _productService.GetAdminProductByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDetailsDto>> CreateProduct([FromBody] AdminProductUpsertDto dto)
    {
        var result = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetProductById), new { id = result.ProductId }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDetailsDto>> UpdateProduct(int id, [FromBody] AdminProductUpsertDto dto)
    {
        var result = await _productService.UpdateProductAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        await _productService.DeleteProductAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:int}/active-status")]
    public async Task<IActionResult> ToggleActiveStatus(int id, [FromBody] UpdateActiveStatusDto dto)
    {
        await _productService.ToggleActiveStatusAsync(id, dto.IsActive);
        return NoContent();
    }
}

[Authorize(Roles = Roles.Admin)]
[ApiController]
[Route("api/v1/admin/inventory")]
public class AdminInventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public AdminInventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryDto>>> GetInventory([FromQuery] string? search = null)
    {
        var result = await _inventoryService.GetInventoryListAsync(search);
        return Ok(result);
    }

    [HttpGet("{productId:int}")]
    public async Task<ActionResult<InventoryDto>> GetProductInventory(int productId)
    {
        var result = await _inventoryService.GetProductInventoryAsync(productId);
        return Ok(result);
    }

    [HttpPatch("{productId:int}")]
    public async Task<ActionResult<InventoryDto>> UpdateInventory(int productId, [FromBody] UpdateInventoryDto dto)
    {
        var result = await _inventoryService.UpdateInventoryAsync(productId, dto);
        return Ok(result);
    }
}
