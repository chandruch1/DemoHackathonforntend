
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { ProductDetailsDto } from '../../../../core/models/product.model';
import { ProductApiService } from '../../../../core/services/product/product-api';

type ProductLoadResult =
  | { kind: 'invalid' }
  | { kind: 'success'; product: ProductDetailsDto }
  | { kind: 'error'; error: HttpErrorResponse };

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails {

  quantity = 1;
  product: ProductDetailsDto | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly productApi = inject(ProductApiService);

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        this.product = null;
        this.quantity = 1;
      }),
      switchMap(productId => {
        if (!Number.isInteger(productId) || productId <= 0) {
          return of({ kind: 'invalid' } satisfies ProductLoadResult);
        }

        return this.productApi.getProductById(productId).pipe(
          map(product => ({ kind: 'success', product }) satisfies ProductLoadResult),
          catchError((error: HttpErrorResponse) =>
            of({ kind: 'error', error } satisfies ProductLoadResult)
          )
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.isLoading = false;

      if (result.kind === 'invalid') {
        this.errorMessage = 'The requested product is not valid.';
        return;
      }

      if (result.kind === 'error') {
        this.errorMessage = this.getLoadErrorMessage(result.error);
        return;
      }

      if (!result.product.isActive) {
        this.errorMessage = 'This product is no longer available.';
        return;
      }

      this.product = result.product;
    });
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.availableQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.product && this.quantity > 1) {
      this.quantity--;
    }
  }

  private getLoadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'This product could not be found.';
    }

    if (error.status === 0) {
      return 'The product service is unavailable. Check your connection and try again.';
    }

    return 'We could not load this product. Please try again later.';
  }
}
