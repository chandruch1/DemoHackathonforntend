<<<<<<< HEAD
import { Component, OnInit, computed, inject, signal } from '@angular/core';
=======
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProductListItemDto } from '../../../../core/models/product.model';
import { ProductApiService } from '../../../../core/services/product/product-api';
<<<<<<< HEAD
import { CategoryApiService } from '../../../../core/services/category/category-api';
=======

type ProductCategoryOption = Pick<ProductListItemDto, 'categoryId' | 'categoryName'>;
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);

<<<<<<< HEAD
  searchText = signal('');
  selectedCategory = signal('All');
  selectedCategoryId = signal<number | undefined>(undefined);
  currentPage = signal(1);
  readonly pageSize = 9;
  totalCount = signal(0);
  totalPages = signal(1);

  categories = signal<string[]>(['All']);
  categoryMap = signal(new Map<string, number>());

  products = signal<ProductListItemDto[]>([]);
  isLoading = signal(false);
  filteredProducts = computed(() => this.products());
  paginatedProducts = computed(() => this.products());

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryApi.getCategories(true).subscribe({
      next: cats => {
        this.categories.set(['All', ...cats.map(c => c.name)]);
        this.categoryMap.set(new Map(cats.map(category => [category.name, category.categoryId])));
      },
      error: () => {
        this.categories.set(['All', 'Pizza', 'Cold Drinks', 'Breads']);
      }
=======
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
    });

    this.destroyRef.onDestroy(() => {
      this.productRequest?.unsubscribe();
      this.searchChanges.complete();
    });

    this.loadProducts();
  }

<<<<<<< HEAD
  loadProducts(): void {
    this.isLoading.set(true);
    this.productApi.getProducts(
      this.currentPage(),
      this.pageSize,
      this.searchText(),
      this.selectedCategoryId()
    ).subscribe({
      next: response => {
        this.products.set(response.items);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.page);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.selectedCategoryId.set(category === 'All' ? undefined : this.categoryMap().get(category));
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSearch(): void {
    this.currentPage.set(1);
=======
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
    this.loadProducts();
  }

  changePage(page: number): void {
<<<<<<< HEAD
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
=======
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
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
