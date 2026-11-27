
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductListItemDto } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList {

  searchText = '';
  selectedCategory = 'All';
  currentPage = 1;
  pageSize = 6;

  categories = ['All', 'Pizza', 'Cold Drinks', 'Breads'];

  // Temporary data matching ProductListItemDto
  products: ProductListItemDto[] = [
    {
      productId: 1,
      name: 'Margherita Pizza',
      shortDescription: 'Classic cheese and tomato pizza',
      categoryId: 1,
      categoryName: 'Pizza',
      price: 199,
      imageUrl: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600',
      availableQuantity: 12,
      isAvailable: true
    },
    {
      productId: 2,
      name: 'Farmhouse Pizza',
      shortDescription: 'Loaded with fresh vegetables',
      categoryId: 1,
      categoryName: 'Pizza',
      price: 249,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
      availableQuantity: 8,
      isAvailable: true
    },
    {
      productId: 3,
      name: 'Fresh Lime Soda',
      shortDescription: 'Refreshing lime drink',
      categoryId: 2,
      categoryName: 'Cold Drinks',
      price: 79,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?w=600',
      availableQuantity: 15,
      isAvailable: true
    },
    {
      productId: 4,
      name: 'Cold Coffee',
      shortDescription: 'Chilled creamy coffee',
      categoryId: 2,
      categoryName: 'Cold Drinks',
      price: 99,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
      availableQuantity: 0,
      isAvailable: false
    },
    {
      productId: 5,
      name: 'Garlic Bread',
      shortDescription: 'Freshly baked garlic bread',
      categoryId: 3,
      categoryName: 'Breads',
      price: 129,
      imageUrl: 'https://images.unsplash.com/photo-1619531040576-f9416740661f?w=600',
      availableQuantity: 10,
      isAvailable: true
    },
    {
      productId: 6,
      name: 'Cheese Bread',
      shortDescription: 'Soft bread with melted cheese',
      categoryId: 3,
      categoryName: 'Breads',
      price: 149,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      availableQuantity: 5,
      isAvailable: true
    }
  ];

  get filteredProducts(): ProductListItemDto[] {
    return this.products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.categoryName === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  get paginatedProducts(): ProductListItemDto[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
