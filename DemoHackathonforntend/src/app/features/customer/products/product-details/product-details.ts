import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, Subscription } from 'rxjs';
import { AddCartItemRequest } from '../../../../core/models/cart.model';
import { ProductDetailsDto } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/auth/auth';
import { CartApiService } from '../../../../core/services/cart/cart-api';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { getApiErrorMessage } from '../../../../core/utils/api-error-message';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly authService = inject(AuthService);
  private productRequest?: Subscription;

  productId = signal<number | null>(null);
  quantity = signal(1);
  product = signal<ProductDetailsDto | null>(null);
  isLoading = signal(true);
  isAddingToCart = signal(false);
  errorMessage = signal<string | null>(null);
  cartMessage = signal<string | null>(null);
  cartErrorMessage = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(id => this.loadProduct(id));

    this.destroyRef.onDestroy(() => this.productRequest?.unsubscribe());
  }

  increaseQuantity(): void {
    const product = this.product();
    if (product && this.quantity() < product.availableQuantity) {
      this.quantity.update(quantity => quantity + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(quantity => quantity - 1);
    }
  }

  addToCart(): void {
    const product = this.product();
    const quantity = this.quantity();
    if (!product || product.availableQuantity < 1 || quantity > product.availableQuantity || this.isAddingToCart()) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/products/${product.productId}` }
      });
      return;
    }

    const request: AddCartItemRequest = { productId: product.productId, quantity };
    this.cartMessage.set(null);
    this.cartErrorMessage.set(null);
    this.isAddingToCart.set(true);

    this.cartApi.addItem(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.cartMessage.set(`${product.name} added to your cart.`);
        this.isAddingToCart.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.cartErrorMessage.set(error.status === 409
          ? 'The requested quantity is no longer available. Please update the quantity and try again.'
          : getApiErrorMessage(error, 'We could not add this product to your cart.'));
        this.isAddingToCart.set(false);
      }
    });
  }

  retry(): void {
    const productId = this.productId();
    if (productId !== null) this.loadProduct(productId);
  }

  private loadProduct(productId: number): void {
    this.productRequest?.unsubscribe();
    this.productId.set(Number.isInteger(productId) && productId > 0 ? productId : null);
    this.product.set(null);
    this.quantity.set(1);
    this.errorMessage.set(null);
    this.cartMessage.set(null);
    this.cartErrorMessage.set(null);

    if (this.productId() === null) {
      this.isLoading.set(false);
      this.errorMessage.set('The requested product is not valid.');
      return;
    }

    this.isLoading.set(true);
    this.productRequest = this.productApi.getProductById(productId).subscribe({
      next: product => {
        if (!product.isActive) {
          this.errorMessage.set('This product is no longer available.');
        } else {
          this.product.set(product);
        }
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.status === 404
          ? 'This product could not be found.'
          : getApiErrorMessage(error, 'We could not load this product. Please try again.'));
        this.isLoading.set(false);
      }
    });
  }
}
