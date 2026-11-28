import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { CategoryDto } from '../../../../core/models/category.model';
import { ProductListItemDto } from '../../../../core/models/product.model';
import { CategoryApiService } from '../../../../core/services/category/category-api';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { getApiErrorMessage } from '../../../../core/utils/api-error-message';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly searchChanges = new Subject<void>();
  private productRequest?: Subscription;

  searchText = signal('');
  selectedCategoryId = signal<number | null>(null);
  currentPage = signal(1);
  readonly pageSize = 9;
  categories = signal<CategoryDto[]>([]);
  products = signal<ProductListItemDto[]>([]);
  totalCount = signal(0);
  totalPages = signal(0);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  categoryErrorMessage = signal<string | null>(null);
  readonly selectedCategoryName = computed(() => {
    const categoryId = this.selectedCategoryId();
    if (categoryId === null) return 'All Products';
    return this.categories().find(category => category.categoryId === categoryId)?.name ?? 'Products';
  });

  constructor() {
    this.searchChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadProducts();
    });

    this.destroyRef.onDestroy(() => {
      this.productRequest?.unsubscribe();
      this.searchChanges.complete();
    });

    this.loadCategories();
    this.loadProducts();
  }

  onSearch(): void {
    this.searchChanges.next();
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategoryId.set(null);
    this.currentPage.set(1);
    this.loadProducts();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  retry(): void {
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoryApi.getCategories(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: categories => this.categories.set(categories),
      error: (error: HttpErrorResponse) => {
        this.categoryErrorMessage.set(getApiErrorMessage(error, 'Product categories are unavailable.'));
      }
    });
  }

  private loadProducts(): void {
    this.productRequest?.unsubscribe();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productRequest = this.productApi.getProducts(
      this.currentPage(),
      this.pageSize,
      this.searchText().trim(),
      this.selectedCategoryId() ?? undefined
    ).subscribe({
      next: response => {
        this.products.set(response.items);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.page);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.products.set([]);
        this.totalCount.set(0);
        this.totalPages.set(0);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not load products. Please try again.'));
        this.isLoading.set(false);
      }
    });
  }
}
