<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
=======

import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartDto, CartItemDto } from '../../../core/models/cart.model';
import { CartApiService } from '../../../core/services/cart/cart-api';
<<<<<<< HEAD
=======
import { getApiErrorMessage } from '../../../core/utils/api-error-message';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  private readonly cartApi = inject(CartApiService);

<<<<<<< HEAD
  cart = signal<CartDto>({
    cartId: 0,
    items: [],
    itemCount: 0,
    subtotal: 0,
    updatedAtUtc: new Date().toISOString()
  });

  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cartApi.getCart().subscribe({
      next: data => {
        this.cart.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'Could not load your shopping cart.');
        this.isLoading.set(false);
      }
    });
  }
=======
  cart: CartDto | null = null;
  isLoading = true;
  isUpdating = false;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly cartApi = inject(CartApiService);

  constructor() {
    this.loadCart();
  }
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

  updateQuantity(item: CartItemDto, change: number): void {
    const newQuantity = item.quantity + change;

    if (
      this.isUpdating ||
      newQuantity < 1 ||
      newQuantity > item.availableQuantity
    ) {
      return;
    }

<<<<<<< HEAD
    this.cartApi.updateItem(item.cartItemId, { quantity: newQuantity }).subscribe({
      next: updatedCart => {
        this.cart.set(updatedCart);
      },
      error: err => {
        alert(err?.error?.message || 'Failed to update item quantity.');
      }
    });
  }

  removeItem(cartItemId: number): void {
    this.cartApi.removeItem(cartItemId).subscribe({
      next: updatedCart => {
        this.cart.set(updatedCart);
      },
      error: err => {
        alert(err?.error?.message || 'Failed to remove item.');
      }
    });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }
=======
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

    this.cartApi.clearCart().subscribe({
      next: () => {
        this.cart.update(cart => ({
          ...cart,
          items: [],
          itemCount: 0,
          subtotal: 0,
          updatedAtUtc: new Date().toISOString()
        }));
      },
      error: err => {
        alert(err?.error?.message || 'Failed to clear cart.');
      }
    });
  }
}
