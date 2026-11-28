<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDetailsDto } from '../../../../core/models/product.model';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { CartApiService } from '../../../../core/services/cart/cart-api';
import { AuthService } from '../../../../core/auth/auth';
=======

import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { AddCartItemRequest } from '../../../../core/models/cart.model';
import { ProductDetailsDto } from '../../../../core/models/product.model';
import { CartApiService } from '../../../../core/services/cart/cart-api';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { getApiErrorMessage } from '../../../../core/utils/api-error-message';

type ProductLoadResult =
  | { kind: 'invalid' }
  | { kind: 'success'; product: ProductDetailsDto }
  | { kind: 'error'; error: HttpErrorResponse };
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly authService = inject(AuthService);

<<<<<<< HEAD
  quantity = signal(1);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  product = signal<ProductDetailsDto>({
    productId: 0,
    name: '',
    description: '',
    categoryId: 0,
    categoryName: '',
    price: 0,
    availableQuantity: 0,
    isActive: true,
    createdAtUtc: ''
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.productApi.getProductById(id).subscribe({
      next: data => {
        this.product.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set('Product could not be loaded.');
        this.isLoading.set(false);
      }
=======
  quantity = 1;
  product: ProductDetailsDto | null = null;
  isLoading = true;
  isAddingToCart = false;
  errorMessage: string | null = null;
  cartMessage: string | null = null;
  cartErrorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly productApi = inject(ProductApiService);
  private readonly cartApi = inject(CartApiService);

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        this.cartMessage = null;
        this.cartErrorMessage = null;
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
    });
  }

  increaseQuantity(): void {
<<<<<<< HEAD
    if (this.quantity() < this.product().availableQuantity) {
      this.quantity.update(quantity => quantity + 1);
=======
    if (this.product && this.quantity < this.product.availableQuantity) {
      this.quantity++;
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
    }
  }

  decreaseQuantity(): void {
<<<<<<< HEAD
    if (this.quantity() > 1) {
      this.quantity.update(quantity => quantity - 1);
=======
    if (this.product && this.quantity > 1) {
      this.quantity--;
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
    }
  }

  addToCart(): void {
<<<<<<< HEAD
    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/products/${this.product().productId}` }
      });
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.cartApi.addItem({
      productId: this.product().productId,
      quantity: this.quantity()
    }).subscribe({
      next: () => {
        this.successMessage.set(`${this.product().name} added to your cart!`);
        setTimeout(() => {
          void this.router.navigate(['/cart']);
        }, 800);
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'Could not add product to cart.');
      }
    });
  }
=======
    if (
      !this.product ||
      this.product.availableQuantity < 1 ||
      this.quantity > this.product.availableQuantity ||
      this.isAddingToCart
    ) {
      return;
    }

    const request: AddCartItemRequest = {
      productId: this.product.productId,
      quantity: this.quantity
    };

    this.cartMessage = null;
    this.cartErrorMessage = null;
    this.isAddingToCart = true;

    this.cartApi.addItem(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.cartMessage = 'Product added to your cart.';
      },
      error: error => {
        this.isAddingToCart = false;
        this.cartErrorMessage = error instanceof HttpErrorResponse && error.status === 409
          ? 'The requested quantity is no longer available. Please update the quantity and try again.'
          : getApiErrorMessage(error, 'We could not add this product to your cart.');
      }
    });
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
}
