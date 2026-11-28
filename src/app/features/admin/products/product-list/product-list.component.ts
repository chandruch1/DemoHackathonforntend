
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ProductListComponent {

  searchText = '';
  showForm = false;
  isEditMode = false;

  products: AdminProduct[] = [
    {
      id: 1,
      name: 'Fresh Milk',
      description: 'Fresh dairy milk',
      category: 'Dairy',
      brand: 'Aavin',
      packaging: '500 ml',
      price: 32,
      stock: 45,
      imageUrl: '',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Whole Wheat Bread',
      description: 'Fresh whole wheat bread',
      category: 'Bakery',
      brand: 'Britannia',
      packaging: '400 g',
      price: 40,
      stock: 8,
      imageUrl: '',
      status: 'Active'
    }
  ];

  formProduct: AdminProduct = this.createEmptyProduct();

  categories = ['Dairy', 'Bakery', 'Grocery', 'Beverages'];
  brands = ['Aavin', 'Britannia', 'India Gate', 'Real'];

  get filteredProducts(): AdminProduct[] {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.products;
    }

    return this.products.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search)
    );
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
    this.isEditMode = false;
    this.formProduct = this.createEmptyProduct();
    this.showForm = true;
  }

  openEditForm(product: AdminProduct): void {
    this.isEditMode = true;
    this.formProduct = { ...product };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveProduct(): void {
    if (
      !this.formProduct.name.trim() ||
      !this.formProduct.category ||
      !this.formProduct.brand ||
      this.formProduct.price <= 0 ||
      this.formProduct.stock < 0
    ) {
      alert('Please enter valid product details.');
      return;
    }

    if (this.isEditMode) {
      this.products = this.products.map(product =>
        product.id === this.formProduct.id
          ? { ...this.formProduct }
          : product
      );
    } else {
      const newProduct: AdminProduct = {
        ...this.formProduct,
        id: Math.max(0, ...this.products.map(p => p.id)) + 1
      };

      this.products = [...this.products, newProduct];
    }

    this.closeForm();
  }

  deleteProduct(product: AdminProduct): void {
    if (confirm(`Delete ${product.name}?`)) {
      this.products = this.products.filter(
        item => item.id !== product.id
      );
    }
  }
}
