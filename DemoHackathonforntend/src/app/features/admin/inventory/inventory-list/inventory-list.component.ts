import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminInventoryApiService } from '../../../../core/services/inventory/admin-inventory-api';

interface InventoryProduct {
  id: number;
  name: string;
  category: string;
  brand: string;
  stock: number;
  lowStockThreshold: number;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {
  private readonly inventoryApi = inject(AdminInventoryApiService);

  searchText = signal('');
  selectedFilter = signal('all');

  showStockForm = signal(false);
  selectedProduct = signal<InventoryProduct | null>(null);

  stockChange = signal(0);
  changeType = signal<'add' | 'reduce'>('add');

  products = signal<InventoryProduct[]>([]);
  filteredProducts = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const selectedFilter = this.selectedFilter();

    return this.products().filter(product => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'low' &&
          product.stock > 0 &&
          product.stock <= product.lowStockThreshold) ||
        (selectedFilter === 'out' && product.stock === 0);

      return matchesSearch && matchesFilter;
    });
  });
  totalItems = computed(() => this.products().length);
  lowStockCount = computed(() => this.products().filter(
    product => product.stock > 0 && product.stock <= product.lowStockThreshold
  ).length);
  outOfStockCount = computed(() => this.products().filter(product => product.stock === 0).length);

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.inventoryApi.getInventory().subscribe({
      next: data => {
        this.products.set(data.map(item => ({
          id: item.productId,
          name: item.productName,
          category: item.categoryName,
          brand: '',
          stock: item.availableQuantity,
          lowStockThreshold: 10
        })));
      }
    });
  }

  getStockStatus(product: InventoryProduct): string {
    if (product.stock === 0) {
      return 'Out of Stock';
    }

    if (product.stock <= product.lowStockThreshold) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  getStockClass(product: InventoryProduct): string {
    if (product.stock === 0) {
      return 'bg-danger';
    }

    if (product.stock <= product.lowStockThreshold) {
      return 'bg-warning text-dark';
    }

    return 'bg-success';
  }

  openStockForm(product: InventoryProduct, type: 'add' | 'reduce'): void {
    this.selectedProduct.set(product);
    this.changeType.set(type);
    this.stockChange.set(0);
    this.showStockForm.set(true);
  }

  closeStockForm(): void {
    this.showStockForm.set(false);
    this.selectedProduct.set(null);
    this.stockChange.set(0);
  }

  saveStockChange(): void {
    const selectedProduct = this.selectedProduct();
    const stockChange = this.stockChange();
    const changeType = this.changeType();
    if (!selectedProduct || stockChange <= 0) {
      return;
    }

    if (
      changeType === 'reduce' &&
      stockChange > selectedProduct.stock
    ) {
      alert('You cannot reduce more stock than currently available.');
      return;
    }

    this.inventoryApi.updateInventory(selectedProduct.id, {
      stockChange,
      changeType
    }).subscribe({
      next: () => {
        this.loadInventory();
        this.closeStockForm();
      },
      error: err => {
        alert(err?.error?.message || 'Failed to update stock.');
      }
    });
  }
}
