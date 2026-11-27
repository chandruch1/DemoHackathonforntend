
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductListItemDto } from '../../../core/models/product.model';
import { ProductApiService } from '../../../core/services/product/product-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

type HomeCategory = Pick<ProductListItemDto, 'categoryId' | 'categoryName'>;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  readonly productsPerPage = 8;
  categories: HomeCategory[] = [];
  products: ProductListItemDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApiService);

  constructor() {
    this.loadProducts();
  }

  retry(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productApi.getProducts(1, this.productsPerPage).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => {
        this.products = response.items;
        this.categories = Array.from(
          new Map(
            response.items.map(product => [
              product.categoryId,
              {
                categoryId: product.categoryId,
                categoryName: product.categoryName
              }
            ])
          ).values()
        );
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.products = [];
        this.categories = [];
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not load the store catalogue. Please try again.'
        );
        this.isLoading = false;
      }
    });
  }

}
