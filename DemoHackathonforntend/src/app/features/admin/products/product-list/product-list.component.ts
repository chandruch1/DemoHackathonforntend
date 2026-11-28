import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { CategoryApiService } from '../../../../core/services/category/category-api';
import { BrandApiService } from '../../../../core/services/brand/brand-api';
import { AdminProductUpsertDto } from '../../../../core/models/product.model';
import { CategoryDto } from '../../../../core/models/category.model';
import { BrandDto } from '../../../../core/models/brand.model';

interface AdminProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  packaging: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly brandApi = inject(BrandApiService);

  searchText = signal('');
  showForm = signal(false);
  isEditMode = signal(false);

  products = signal<AdminProduct[]>([]);
  categoriesList = signal<CategoryDto[]>([]);
  brandsList = signal<BrandDto[]>([]);

  categories = computed(() => this.categoriesList().map(category => category.name));
  brands = computed(() => this.brandsList().map(brand => brand.name));

  formProduct = signal<AdminProduct>(this.createEmptyProduct());
  filteredProducts = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const products = this.products();

    if (!search) {
      return products;
    }

    return products.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadCatalogMetadata();
    this.loadProducts();
  }

  loadCatalogMetadata(): void {
    this.categoryApi.getCategories(false).subscribe({
      next: cats => {
        this.categoriesList.set(cats);
      }
    });

    this.brandApi.getBrands(false).subscribe({
      next: bList => {
        this.brandsList.set(bList);
      }
    });
  }

  loadProducts(): void {
    this.productApi.getAdminProducts().subscribe({
      next: items => {
        this.products.set(items.map(p => ({
          id: p.productId,
          name: p.name,
          description: p.description,
          category: p.categoryName,
          brand: p.brandName || '',
          packaging: p.packagingInfo || '',
          price: p.price,
          stock: p.availableQuantity,
          imageUrl: p.imageUrl || '',
          status: p.isActive ? 'Active' : 'Inactive'
        })));
      }
    });
  }

  createEmptyProduct(): AdminProduct {
    return {
      id: 0,
      name: '',
      description: '',
      category: '',
      brand: '',
      packaging: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      status: 'Active'
    };
  }

  openAddForm(): void {
    this.isEditMode.set(false);
    const formProduct = this.createEmptyProduct();
    const categories = this.categories();
    const brands = this.brands();
    if (categories.length > 0) {
      formProduct.category = categories[0];
    }
    if (brands.length > 0) {
      formProduct.brand = brands[0];
    }
    this.formProduct.set(formProduct);
    this.showForm.set(true);
  }

  openEditForm(product: AdminProduct): void {
    this.isEditMode.set(true);
    this.formProduct.set({ ...product });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  updateFormProduct(changes: Partial<AdminProduct>): void {
    this.formProduct.update(product => ({ ...product, ...changes }));
  }

  saveProduct(): void {
    const formProduct = this.formProduct();
    if (
      !formProduct.name.trim() ||
      !formProduct.category ||
      formProduct.price <= 0 ||
      formProduct.stock < 0
    ) {
      alert('Please enter valid product details.');
      return;
    }

    const categoryObj = this.categoriesList().find(c => c.name.toLowerCase() === formProduct.category.toLowerCase());
    const brandObj = this.brandsList().find(b => b.name.toLowerCase() === formProduct.brand.toLowerCase());

    if (!categoryObj) {
      alert('Selected category is invalid.');
      return;
    }

    const payload: AdminProductUpsertDto = {
      name: formProduct.name.trim(),
      description: formProduct.description?.trim() || '',
      categoryId: categoryObj.categoryId,
      brandId: brandObj ? brandObj.brandId : undefined,
      packagingInfo: formProduct.packaging?.trim() || '',
      price: formProduct.price,
      availableQuantity: formProduct.stock,
      imageUrl: formProduct.imageUrl?.trim() || '',
      isActive: formProduct.status === 'Active'
    };

    if (this.isEditMode()) {
      this.productApi.updateProduct(formProduct.id, payload).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to update product.');
        }
      });
    } else {
      this.productApi.createProduct(payload).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to create product.');
        }
      });
    }
  }

  deleteProduct(product: AdminProduct): void {
    if (confirm(`Delete ${product.name}?`)) {
      this.productApi.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to delete product.');
        }
      });
    }
  }
}
