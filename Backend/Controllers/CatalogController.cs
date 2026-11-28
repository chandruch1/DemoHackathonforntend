using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories([FromQuery] bool activeOnly = false)
    {
        var result = await _categoryService.GetCategoriesAsync(activeOnly);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetCategoryById(int id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/brands")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandDto>>> GetBrands([FromQuery] bool activeOnly = false)
    {
        var result = await _brandService.GetBrandsAsync(activeOnly);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BrandDto>> GetBrandById(int id)
    {
        var result = await _brandService.GetBrandByIdAsync(id);
        return Ok(result);
    }
}
