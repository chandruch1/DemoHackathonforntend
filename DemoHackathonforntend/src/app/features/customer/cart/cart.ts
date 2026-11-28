import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartApi = inject(CartApiService);

  cart = signal<CartDto | null>(null);
  isLoading = signal(true);
  isUpdating = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cartApi.getCart().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: cart => {
        this.cart.set(cart);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.cart.set(null);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not load your cart. Please try again.'));
        this.isLoading.set(false);
      }
    });
  }

  updateQuantity(item: CartItemDto, change: number): void {
    const newQuantity = item.quantity + change;
    if (this.isUpdating() || newQuantity < 1 || newQuantity > item.availableQuantity) return;
    this.runMutation(this.cartApi.updateItem(item.cartItemId, { quantity: newQuantity }));
  }

  removeItem(cartItemId: number): void {
    if (!this.isUpdating()) {
      this.runMutation(this.cartApi.removeItem(cartItemId));
    }
  }

  clearCart(): void {
    if (!this.isUpdating() && confirm('Are you sure you want to clear your cart?')) {
      this.runMutation(this.cartApi.clearCart());
    }
  }

  retry(): void {
    this.loadCart();
  }

  private runMutation(request: Observable<CartDto | void>): void {
    this.isUpdating.set(true);
    this.errorMessage.set(null);
    request.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: cart => {
        this.isUpdating.set(false);
        if (cart) {
          this.cart.set(cart);
        } else {
          this.loadCart();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getApiErrorMessage(error, 'We could not update your cart. Please try again.'));
        this.isUpdating.set(false);
      }
    });
  }
}
