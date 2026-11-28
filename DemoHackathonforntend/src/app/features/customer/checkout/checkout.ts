import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { AddressDto } from '../../../core/models/address.model';
import { CartDto } from '../../../core/models/cart.model';
import { CheckoutRequest, CheckoutResponse, PaymentMethod } from '../../../core/models/checkout.model';
import { AddressApiService } from '../../../core/services/address/address-api';
import { CartApiService } from '../../../core/services/cart/cart-api';
import { OrderApiService } from '../../../core/services/order/order-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private readonly destroyRef = inject(DestroyRef);
  private readonly addressApi = inject(AddressApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly orderApi = inject(OrderApiService);

  addresses = signal<AddressDto[]>([]);
  cart = signal<CartDto | null>(null);
  checkoutResult = signal<CheckoutResponse | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  selectedAddressId = signal<number | null>(null);
  deliveryInstructions = signal('');
  readonly paymentMethod: PaymentMethod = 'CashOnDelivery';
  readonly subtotal = computed(() => this.cart()?.subtotal ?? 0);

  constructor() {
    this.loadCheckoutData();
  }

  placeOrder(): void {
    const addressId = this.selectedAddressId();
    const cart = this.cart();
    if (this.isSubmitting() || addressId === null || !cart?.items.length) return;

    const request: CheckoutRequest = {
      addressId,
      deliveryInstructions: this.deliveryInstructions().trim() || undefined,
      paymentMethod: this.paymentMethod
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.orderApi.checkout(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.checkoutResult.set(response);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getApiErrorMessage(error, 'We could not place your order. Please try again.'));
        this.isSubmitting.set(false);
      }
    });
  }

  retry(): void {
    this.loadCheckoutData();
  }

  private loadCheckoutData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    forkJoin({
      addresses: this.addressApi.getAddresses(),
      cart: this.cartApi.getCart()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ addresses, cart }) => {
        this.addresses.set(addresses);
        this.cart.set(cart);
        this.selectedAddressId.set(
          addresses.find(address => address.isDefault)?.addressId ??
          addresses[0]?.addressId ??
          null
        );
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.addresses.set([]);
        this.cart.set(null);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not load checkout details. Please try again.'));
        this.isLoading.set(false);
      }
    });
  }
}
