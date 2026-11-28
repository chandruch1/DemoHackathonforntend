namespace RetailOrderingApi.Models;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
}

public static class OrderStatus
{
    public const string PendingPayment = "PendingPayment";
    public const string Placed = "Placed";
    public const string Confirmed = "Confirmed";
    public const string Processing = "Processing";
    public const string ReadyForDispatch = "ReadyForDispatch";
    public const string Shipped = "Shipped";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";

    public static readonly string[] AllStatuses =
    [
        PendingPayment, Placed, Confirmed, Processing, ReadyForDispatch, Shipped, Delivered, Cancelled
    ];
}

public static class PaymentStatus
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Failed = "Failed";
    public const string Refunded = "Refunded";
}

public static class PaymentProviders
{
    public const string Razorpay = "Razorpay";
    public const string CashOnDelivery = "CashOnDelivery";
}
