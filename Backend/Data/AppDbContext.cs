using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Models;

namespace RetailOrderingApi.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Category
        builder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.CategoryId);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(c => c.Name).IsUnique();
        });

        // Brand
        builder.Entity<Brand>(entity =>
        {
            entity.HasKey(b => b.BrandId);
            entity.Property(b => b.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(b => b.Name).IsUnique();
        });

        // Product
        builder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.ProductId);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Price).HasPrecision(18, 2);

            entity.HasOne(p => p.Category)
                  .WithMany(c => c.Products)
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Brand)
                  .WithMany(b => b.Products)
                  .HasForeignKey(p => p.BrandId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(p => p.Inventory)
                  .WithOne(i => i.Product)
                  .HasForeignKey<Inventory>(i => i.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Inventory
        builder.Entity<Inventory>(entity =>
        {
            entity.HasKey(i => i.InventoryId);
            entity.HasIndex(i => i.ProductId).IsUnique();
        });

        // Cart
        builder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.CartId);
            entity.HasIndex(c => c.CustomerId).IsUnique();

            entity.HasOne(c => c.Customer)
                  .WithOne(u => u.Cart)
                  .HasForeignKey<Cart>(c => c.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(c => c.Items)
                  .WithOne(ci => ci.Cart)
                  .HasForeignKey(ci => ci.CartId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CartItem
        builder.Entity<CartItem>(entity =>
        {
            entity.HasKey(ci => ci.CartItemId);
            entity.HasIndex(ci => new { ci.CartId, ci.ProductId }).IsUnique();

            entity.HasOne(ci => ci.Product)
                  .WithMany(p => p.CartItems)
                  .HasForeignKey(ci => ci.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Address
        builder.Entity<Address>(entity =>
        {
            entity.HasKey(a => a.AddressId);
            entity.Property(a => a.RecipientName).IsRequired().HasMaxLength(150);
            entity.Property(a => a.Phone).IsRequired().HasMaxLength(20);
            entity.Property(a => a.AddressLine1).IsRequired().HasMaxLength(250);
            entity.Property(a => a.City).IsRequired().HasMaxLength(100);
            entity.Property(a => a.State).IsRequired().HasMaxLength(100);
            entity.Property(a => a.PostalCode).IsRequired().HasMaxLength(20);

            entity.HasOne(a => a.Customer)
                  .WithMany(u => u.Addresses)
                  .HasForeignKey(a => a.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Order
        builder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.OrderId);
            entity.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(o => o.OrderNumber).IsUnique();

            entity.Property(o => o.Subtotal).HasPrecision(18, 2);
            entity.Property(o => o.DeliveryFee).HasPrecision(18, 2);
            entity.Property(o => o.TotalAmount).HasPrecision(18, 2);

            entity.Property(o => o.RecipientName).IsRequired().HasMaxLength(150);
            entity.Property(o => o.Phone).IsRequired().HasMaxLength(20);
            entity.Property(o => o.AddressLine1).IsRequired().HasMaxLength(250);
            entity.Property(o => o.City).IsRequired().HasMaxLength(100);
            entity.Property(o => o.State).IsRequired().HasMaxLength(100);
            entity.Property(o => o.PostalCode).IsRequired().HasMaxLength(20);

            entity.HasOne(o => o.Customer)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(o => o.Items)
                  .WithOne(oi => oi.Order)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(o => o.Payment)
                  .WithOne(p => p.Order)
                  .HasForeignKey<Payment>(p => p.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(o => o.StatusHistories)
                  .WithOne(h => h.Order)
                  .HasForeignKey(h => h.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // OrderItem
        builder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.OrderItemId);
            entity.Property(oi => oi.ProductNameSnapshot).IsRequired().HasMaxLength(200);
            entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            entity.Property(oi => oi.LineTotal).HasPrecision(18, 2);

            entity.HasOne(oi => oi.Product)
                  .WithMany(p => p.OrderItems)
                  .HasForeignKey(oi => oi.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        builder.Entity<Payment>(entity =>
        {
            entity.HasKey(p => p.PaymentId);
            entity.HasIndex(p => p.OrderId).IsUnique();
            entity.Property(p => p.Amount).HasPrecision(18, 2);
            entity.Property(p => p.Currency).HasMaxLength(10);
            entity.Property(p => p.Provider).HasMaxLength(50);
            entity.Property(p => p.Status).HasMaxLength(50);
        });

        // OrderStatusHistory
        builder.Entity<OrderStatusHistory>(entity =>
        {
            entity.HasKey(h => h.HistoryId);
            entity.Property(h => h.NewStatus).IsRequired().HasMaxLength(50);
            entity.Property(h => h.OldStatus).HasMaxLength(50);
        });
    }
}
