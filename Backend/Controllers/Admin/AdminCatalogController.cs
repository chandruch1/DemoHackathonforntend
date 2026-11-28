using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;
using RetailOrderingApi.Services.Interfaces;

namespace RetailOrderingApi.Controllers.Admin;

[Authorize(Roles = Roles.Admin)]
[ApiController]
[Route("api/v1/admin/categories")]
public class AdminCategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public AdminCategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var result = await _categoryService.GetCategoriesAsync(activeOnly: false);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetCategoryById(int id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryUpsertDto dto)
    {
        var result = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategoryById), new { id = result.CategoryId }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] CategoryUpsertDto dto)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await _categoryService.DeleteCategoryAsync(id);
        return NoContent();
    }
}

[Authorize(Roles = Roles.Admin)]
[ApiController]
[Route("api/v1/admin/brands")]
public class AdminBrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public AdminBrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandDto>>> GetBrands()
    {
        var result = await _brandService.GetBrandsAsync(activeOnly: false);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BrandDto>> GetBrandById(int id)
    {
        var result = await _brandService.GetBrandByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BrandDto>> CreateBrand([FromBody] BrandUpsertDto dto)
    {
        var result = await _brandService.CreateBrandAsync(dto);
        return CreatedAtAction(nameof(GetBrandById), new { id = result.BrandId }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BrandDto>> UpdateBrand(int id, [FromBody] BrandUpsertDto dto)
    {
        var result = await _brandService.UpdateBrandAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBrand(int id)
    {
        await _brandService.DeleteBrandAsync(id);
        return NoContent();
    }
}
