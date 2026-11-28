using RetailOrderingApi.DTOs;
using RetailOrderingApi.Models;

namespace RetailOrderingApi.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user, string role, out DateTime expiresAtUtc);
}

public interface IAuthService
{
    Task<UserSummaryDto> RegisterAsync(RegisterCustomerRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserSummaryDto> GetCurrentUserAsync(string userId);
    Task<UserSummaryDto> UpdateProfileAsync(string userId, UpdateCustomerProfileRequest request);
    Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
}

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetCategoriesAsync(bool activeOnly = false);
    Task<CategoryDto> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CategoryUpsertDto dto);
    Task<CategoryDto> UpdateCategoryAsync(int id, CategoryUpsertDto dto);
    Task DeleteCategoryAsync(int id);
}

public interface IBrandService
{
    Task<IEnumerable<BrandDto>> GetBrandsAsync(bool activeOnly = false);
    Task<BrandDto> GetBrandByIdAsync(int id);
    Task<BrandDto> CreateBrandAsync(BrandUpsertDto dto);
    Task<BrandDto> UpdateBrandAsync(int id, BrandUpsertDto dto);
    Task DeleteBrandAsync(int id);
}
