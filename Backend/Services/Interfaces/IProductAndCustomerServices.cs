using RetailOrderingApi.DTOs;

namespace RetailOrderingApi.Services.Interfaces;

public interface IProductService
{
    Task<PagedResponse<ProductListItemDto>> GetProductsAsync(
        int page = 1,
        int pageSize = 12,
        string? search = null,
        int? categoryId = null,
        int? brandId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? sortBy = null);

    Task<ProductDetailsDto> GetProductByIdAsync(int productId);

    Task<IEnumerable<ProductDetailsDto>> GetAdminProductsAsync(string? search = null, int? categoryId = null, int? brandId = null);
    Task<ProductDetailsDto> GetAdminProductByIdAsync(int productId);
    Task<ProductDetailsDto> CreateProductAsync(AdminProductUpsertDto dto);
    Task<ProductDetailsDto> UpdateProductAsync(int id, AdminProductUpsertDto dto);
    Task DeleteProductAsync(int id);
    Task ToggleActiveStatusAsync(int id, bool isActive);
}

public interface IInventoryService
{
    Task<IEnumerable<InventoryDto>> GetInventoryListAsync(string? search = null);
    Task<InventoryDto> GetProductInventoryAsync(int productId);
    Task<InventoryDto> UpdateInventoryAsync(int productId, UpdateInventoryDto dto);
}

public interface ICartService
{
    Task<CartDto> GetCartAsync(string customerId);
    Task<CartDto> AddItemToCartAsync(string customerId, AddCartItemRequest request);
    Task<CartDto> UpdateCartItemAsync(string customerId, int cartItemId, UpdateCartItemRequest request);
    Task<CartDto> RemoveCartItemAsync(string customerId, int cartItemId);
    Task ClearCartAsync(string customerId);
}

public interface IAddressService
{
    Task<IEnumerable<AddressDto>> GetAddressesAsync(string customerId);
    Task<AddressDto> CreateAddressAsync(string customerId, CreateAddressRequest request);
    Task<AddressDto> UpdateAddressAsync(string customerId, int addressId, CreateAddressRequest request);
    Task DeleteAddressAsync(string customerId, int addressId);
    Task SetDefaultAddressAsync(string customerId, int addressId);
}
