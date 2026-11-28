namespace RetailOrderingApi.Models;

public class OrderStatusHistory
{
    public int HistoryId { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? ChangedByUserId { get; set; }
    public string? ChangedByName { get; set; }
    public string? Note { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
