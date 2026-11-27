import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProductListItemDto } from '../../../../core/models/product.model';
import { ProductApiService } from '../../../../core/services/product/product-api';

type ProductCategoryOption = Pick<ProductListItemDto, 'categoryId' | 'categoryName'>;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList {

  searchText = '';
  selectedCategoryId: number | null = null;
  currentPage = 1;
  readonly pageSize = 6;

  categories: ProductCategoryOption[] = [];
  products: ProductListItemDto[] = [];
  totalCount = 0;
  totalPages = 0;
  isLoading = true;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<void>();
  private productRequest?: Subscription;

  constructor(private readonly productApi: ProductApiService) {
    this.searchChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });

    this.destroyRef.onDestroy(() => {
      this.productRequest?.unsubscribe();
      this.searchChanges.complete();
    });

    this.loadProducts();
  }

  get selectedCategoryName(): string {
    if (this.selectedCategoryId === null) {
      return 'All Products';
    }

    return this.categories.find(
      category => category.categoryId === this.selectedCategoryId
    )?.categoryName ?? 'Products';
  }

  onSearch(): void {
    this.searchChanges.next();
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategoryId = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  retry(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productRequest?.unsubscribe();
    this.isLoading = true;
    this.errorMessage = null;

    this.productRequest = this.productApi.getProducts(
      this.currentPage,
      this.pageSize,
      this.searchText.trim(),
      this.selectedCategoryId ?? undefined
    ).subscribe({
      next: response => {
        this.products = response.items;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;

        const categoryOptions = new Map(
          this.categories.map(category => [category.categoryId, category])
        );
        for (const product of response.items) {
          categoryOptions.set(product.categoryId, {
            categoryId: product.categoryId,
            categoryName: product.categoryName
          });
        }
        this.categories = Array.from(categoryOptions.values());
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.products = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.errorMessage = this.getLoadErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private getLoadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The product service is unavailable. Check your connection and try again.';
    }

    if (error.status >= 500) {
      return 'The product service encountered an error. Please try again later.';
    }

    return 'We could not load products. Please try again.';
  }
}
