namespace RetailOrderingApi.Models;

public class Inventory
{
    public int InventoryId { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int AvailableQuantity { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
