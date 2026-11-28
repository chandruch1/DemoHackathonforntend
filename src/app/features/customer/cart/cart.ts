
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartDto, CartItemDto } from '../../../core/models/cart.model';
import { CartApiService } from '../../../core/services/cart/cart-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  cart: CartDto | null = null;
  isLoading = true;
  isUpdating = false;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly cartApi = inject(CartApiService);

  constructor() {
    this.loadCart();
  }

  updateQuantity(item: CartItemDto, change: number): void {
    const newQuantity = item.quantity + change;

    if (
      this.isUpdating ||
      newQuantity < 1 ||
      newQuantity > item.availableQuantity
    ) {
      return;
    }

    this.runMutation(
      this.cartApi.updateItem(item.cartItemId, { quantity: newQuantity })
    );
  }

  removeItem(cartItemId: number): void {
    if (!this.isUpdating) {
      this.runMutation(this.cartApi.removeItem(cartItemId));
    }
  }

  clearCart(): void {
    if (!this.isUpdating) {
      this.runMutation(this.cartApi.clearCart());
    }
  }

  retry(): void {
    this.loadCart();
  }

  private loadCart(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cartApi.getCart().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: cart => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not load your cart. Please try again.'
        );
        this.isLoading = false;
      }
    });
  }

  private runMutation(request: ReturnType<CartApiService['getCart']>): void {
    this.isUpdating = true;
    this.errorMessage = null;
    request.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: cart => {
        this.cart = cart;
        this.isUpdating = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not update your cart. Please try again.'
        );
        this.isUpdating = false;
      }
    });
  }

}
