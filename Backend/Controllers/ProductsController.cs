using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers;

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ProductListItemDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? sortBy = null)
    {
        var result = await _productService.GetProductsAsync(page, pageSize, search, categoryId, brandId, minPrice, maxPrice, sortBy);
        return Ok(result);
    }

    [HttpGet("{productId:int}")]
    public async Task<ActionResult<ProductDetailsDto>> GetProductById(int productId)
    {
        var result = await _productService.GetProductByIdAsync(productId);
        return Ok(result);
    }
}
