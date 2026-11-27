import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { AddressDto } from '../../../core/models/address.model';
import { CartDto } from '../../../core/models/cart.model';
import {
  CheckoutRequest,
  CheckoutResponse,
  PaymentMethod
} from '../../../core/models/checkout.model';
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

  addresses: AddressDto[] = [];
  cart: CartDto | null = null;
  checkoutResult: CheckoutResponse | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;

  selectedAddressId: number | null = null;

  readonly paymentMethod: PaymentMethod = 'CashOnDelivery';

  deliveryInstructions = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly addressApi = inject(AddressApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly orderApi = inject(OrderApiService);

  constructor() {
    this.loadCheckoutData();
  }

  placeOrder(): void {
    if (
      this.isSubmitting ||
      this.selectedAddressId === null ||
      !this.cart?.items.length
    ) {
      return;
    }

    const request: CheckoutRequest = {
      addressId: this.selectedAddressId,
      deliveryInstructions: this.deliveryInstructions || undefined,
      paymentMethod: this.paymentMethod
    };

    this.isSubmitting = true;
    this.errorMessage = null;
    this.orderApi.checkout(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => {
        this.checkoutResult = response;
        this.isSubmitting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not place your order. Please try again.'
        );
        this.isSubmitting = false;
      }
    });
  }

  retry(): void {
    this.loadCheckoutData();
  }

  private loadCheckoutData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    forkJoin({
      addresses: this.addressApi.getAddresses(),
      cart: this.cartApi.getCart()
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ addresses, cart }) => {
        this.addresses = addresses;
        this.cart = cart;
        this.selectedAddressId =
          addresses.find(address => address.isDefault)?.addressId ??
          addresses[0]?.addressId ??
          null;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.addresses = [];
        this.cart = null;
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not load checkout details. Please try again.'
        );
        this.isLoading = false;
      }
    });
  }
}