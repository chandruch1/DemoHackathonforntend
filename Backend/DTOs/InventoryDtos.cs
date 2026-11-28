namespace RetailOrderingApi.DTOs;

public class InventoryDto
{
    public int InventoryId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int AvailableQuantity { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public class UpdateInventoryDto
{
    public int StockChange { get; set; }
    public string ChangeType { get; set; } = "add"; // "add", "reduce", or "set"
}
