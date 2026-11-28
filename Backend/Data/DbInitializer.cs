using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RetailOrderingApi.Models;

namespace RetailOrderingApi.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Ensure database exists
        await context.Database.MigrateAsync();

        // 1. Seed Roles
        var roles = new[] { Roles.Admin, Roles.Customer };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Seed Default Admin User
        var adminEmail = configuration["AdminSeed:Email"] ?? "admin@retailstore.com";
        var adminPassword = configuration["AdminSeed:Password"] ?? "Admin@Password123!";
        var adminFullName = configuration["AdminSeed:FullName"] ?? "System Administrator";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = adminFullName,
                PhoneNumber = "9999999999",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.Admin);
            }
        }

        // 3. Seed Categories if empty
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Pizza", Description = "Authentic handcrafted Italian pizzas with artisanal toppings and rich mozzarella.", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Cold Drinks", Description = "Refreshing beverages, sodas, and chilled iced mocktails.", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Breads", Description = "Freshly baked artisan garlic breads, sourdough, and baguettes.", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 4. Seed Brands if empty
        if (!await context.Brands.AnyAsync())
        {
            var brands = new List<Brand>
            {
                new() { Name = "Artisan Crust", Description = "Authentic gourmet pizza craftsmanship.", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Fizz & Chill", Description = "Refreshing cold beverages and crafted coolers.", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Bakehouse Fresh", Description = "Daily oven-fresh artisanal bakery goods.", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await context.Brands.AddRangeAsync(brands);
            await context.SaveChangesAsync();
        }

        // 5. Seed Products with Inventories if empty
        if (!await context.Products.AnyAsync())
        {
            var pizzaCategory = await context.Categories.FirstAsync(c => c.Name == "Pizza");
            var drinksCategory = await context.Categories.FirstAsync(c => c.Name == "Cold Drinks");
            var breadsCategory = await context.Categories.FirstAsync(c => c.Name == "Breads");

            var pizzaBrand = await context.Brands.FirstAsync(b => b.Name == "Artisan Crust");
            var drinksBrand = await context.Brands.FirstAsync(b => b.Name == "Fizz & Chill");
            var breadsBrand = await context.Brands.FirstAsync(b => b.Name == "Bakehouse Fresh");

            var products = new List<Product>
            {
                new()
                {
                    Name = "Classic Margherita Pizza",
                    Description = "Rich San Marzano tomato sauce, fresh buffalo mozzarella, aromatic basil leaves, and extra virgin olive oil.",
                    CategoryId = pizzaCategory.CategoryId,
                    BrandId = pizzaBrand.BrandId,
                    PackagingInfo = "Medium (10 inches) - Serves 2",
                    Price = 249.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 25, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Farmhouse Veggie Supreme Pizza",
                    Description = "Loaded with crunchy bell peppers, sweet corn, button mushrooms, black olives, red onions, and mozzarella.",
                    CategoryId = pizzaCategory.CategoryId,
                    BrandId = pizzaBrand.BrandId,
                    PackagingInfo = "Large (12 inches) - Serves 3",
                    Price = 349.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 20, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Spicy Paneer Tikka Pizza",
                    Description = "Tandoori marinated paneer cubes, red paprika, sliced capsicum, and golden baked cheese with herbs.",
                    CategoryId = pizzaCategory.CategoryId,
                    BrandId = pizzaBrand.BrandId,
                    PackagingInfo = "Medium (10 inches) - Serves 2",
                    Price = 319.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 15, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Fresh Lime Mint Cooler",
                    Description = "Sparkling chilled soda with freshly squeezed green limes, aromatic garden mint, and rock salt.",
                    CategoryId = drinksCategory.CategoryId,
                    BrandId = drinksBrand.BrandId,
                    PackagingInfo = "350 ml Bottle",
                    Price = 79.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 40, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Chilled Cold Coffee Frappe",
                    Description = "Creamy Arabica espresso blended with cold milk, chocolate drizzle, and topped with rich foam.",
                    CategoryId = drinksCategory.CategoryId,
                    BrandId = drinksBrand.BrandId,
                    PackagingInfo = "300 ml Cup",
                    Price = 119.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 30, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Iced Lemon Green Tea",
                    Description = "Pure brewed organic green tea infused with sunny lemon zest and lightly sweetened with honey.",
                    CategoryId = drinksCategory.CategoryId,
                    BrandId = drinksBrand.BrandId,
                    PackagingInfo = "350 ml Can",
                    Price = 89.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 35, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Cheesy Garlic Herb Breadsticks",
                    Description = "Golden baked breadsticks topped with rich garlic herb butter and strings of melted mozzarella cheese.",
                    CategoryId = breadsCategory.CategoryId,
                    BrandId = breadsBrand.BrandId,
                    PackagingInfo = "4 Pieces - 200g",
                    Price = 149.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 22, UpdatedAt = DateTime.UtcNow }
                },
                new()
                {
                    Name = "Stuffed Jalapeno Garlic Loaf",
                    Description = "Oven-warm pull-apart loaf stuffed with spicy sliced jalapenos, garlic butter, and smoked gouda.",
                    CategoryId = breadsCategory.CategoryId,
                    BrandId = breadsBrand.BrandId,
                    PackagingInfo = "Single Loaf - 250g",
                    Price = 169.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Inventory = new Inventory { AvailableQuantity = 18, UpdatedAt = DateTime.UtcNow }
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
}
