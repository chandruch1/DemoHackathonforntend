import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductListItemDto } from '../../../core/models/product.model';
import { ProductApiService } from '../../../core/services/product/product-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApiService);

  readonly productsPerPage = 8;
  readonly products = signal<ProductListItemDto[]>([]);
  readonly categories = computed(() => {
    const categories = new Map<number, { categoryId: number; categoryName: string }>();
    for (const product of this.products()) {
      categories.set(product.categoryId, {
        categoryId: product.categoryId,
        categoryName: product.categoryName
      });
    }
    return Array.from(categories.values());
  });
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loadProducts();
  }

  retry(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productApi.getProducts(1, this.productsPerPage).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => {
        this.products.set(response.items);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.products.set([]);
        this.errorMessage.set(getApiErrorMessage(
          error,
          'We could not load the store catalogue. Please try again.'
        ));
        this.isLoading.set(false);
      }
    });
  }
}
