namespace RetailOrderingApi.DTOs;

public class PagedResponse<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
}

public class ProductListItemDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int AvailableQuantity { get; set; }
    public bool IsAvailable => AvailableQuantity > 0;
}

public class ProductDetailsDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? BrandId { get; set; }
    public string? BrandName { get; set; }
    public string? PackagingInfo { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int AvailableQuantity { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class AdminProductUpsertDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public string? PackagingInfo { get; set; }
    public decimal Price { get; set; }
    public int AvailableQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateActiveStatusDto
{
    public bool IsActive { get; set; }
}
