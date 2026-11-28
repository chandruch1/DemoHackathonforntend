<<<<<<< HEAD
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AddressDto } from '../../../core/models/address.model';
import { CheckoutRequest, PaymentMethod } from '../../../core/models/checkout.model';
import { AddressApiService } from '../../../core/services/address/address-api';
import { CartApiService } from '../../../core/services/cart/cart-api';
import { OrderApiService } from '../../../core/services/order/order-api';
import { PaymentApiService } from '../../../core/services/payment/payment-api';

declare const window: any;
=======
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  private readonly addressApi = inject(AddressApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly orderApi = inject(OrderApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly router = inject(Router);

<<<<<<< HEAD
  addresses = signal<AddressDto[]>([]);
  selectedAddressId = signal(0);
  paymentMethod = signal<PaymentMethod>('Razorpay');
  deliveryInstructions = signal('');

  subtotal = signal(0);
  deliveryFee = signal(40);
  isPlacingOrder = signal(false);
  errorMessage = signal('');
  totalAmount = computed(() => this.subtotal() + this.deliveryFee());

  ngOnInit(): void {
    this.loadAddresses();
    this.loadCart();
  }
=======
  addresses: AddressDto[] = [];
  cart: CartDto | null = null;
  checkoutResult: CheckoutResponse | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;

  selectedAddressId: number | null = null;

  readonly paymentMethod: PaymentMethod = 'CashOnDelivery';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

  loadAddresses(): void {
    this.addressApi.getAddresses().subscribe({
      next: data => {
        this.addresses.set(data);
        const defaultAddr = data.find(a => a.isDefault) ?? data[0];
        if (defaultAddr) {
          this.selectedAddressId.set(defaultAddr.addressId);
        }
      },
      error: () => {
        this.errorMessage.set('Could not load your addresses. Please add a delivery address.');
      }
    });
  }

<<<<<<< HEAD
  loadCart(): void {
    this.cartApi.getCart().subscribe({
      next: cart => {
        this.subtotal.set(cart.subtotal);
        this.deliveryFee.set(cart.subtotal >= 500 || cart.subtotal === 0 ? 0 : 40);
      }
    });
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  placeOrder(): void {
    const selectedAddressId = this.selectedAddressId();
    const paymentMethod = this.paymentMethod();
    if (!selectedAddressId) {
      alert('Please select or add a delivery address first.');
      return;
    }

    this.isPlacingOrder.set(true);
    this.errorMessage.set('');

=======
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

>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
    const request: CheckoutRequest = {
      addressId: selectedAddressId,
      deliveryInstructions: this.deliveryInstructions().trim() || undefined,
      paymentMethod
    };

<<<<<<< HEAD
    this.orderApi.checkout(request).subscribe({
      next: res => {
        this.isPlacingOrder.set(false);

        if (paymentMethod === 'CashOnDelivery') {
          void this.router.navigate(['/payment/result'], {
            queryParams: {
              orderId: res.orderId,
              orderNumber: res.orderNumber,
              status: 'success'
            }
          });
          return;
        }

        // Razorpay Payment Flow
        if (typeof window !== 'undefined' && window.Razorpay && res.payment) {
          const options = {
            key: res.payment.razorpayKeyId,
            amount: Math.round(res.totalAmount * 100),
            currency: 'INR',
            name: 'Retail Ordering Store',
            description: `Payment for Order #${res.orderNumber}`,
            order_id: res.payment.providerOrderId,
            handler: (response: any) => {
              this.paymentApi.verifyRazorpay({
                orderId: res.orderId,
                razorpayOrderId: response.razorpay_order_id || res.payment?.providerOrderId || '',
                razorpayPaymentId: response.razorpay_payment_id || 'pay_test_dummy',
                razorpaySignature: response.razorpay_signature || 'test_signature'
              }).subscribe({
                next: () => {
                  void this.router.navigate(['/payment/result'], {
                    queryParams: {
                      orderId: res.orderId,
                      orderNumber: res.orderNumber,
                      status: 'success'
                    }
                  });
                },
                error: () => {
                  void this.router.navigate(['/payment/result'], {
                    queryParams: {
                      orderId: res.orderId,
                      orderNumber: res.orderNumber,
                      status: 'failed'
                    }
                  });
                }
              });
            },
            prefill: {
              name: this.addresses().find(a => a.addressId === selectedAddressId)?.recipientName,
              contact: this.addresses().find(a => a.addressId === selectedAddressId)?.phone
            },
            theme: {
              color: '#dc3545'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // In test mode or when external script isn't loaded: verify automatically using test signature
          this.paymentApi.verifyRazorpay({
            orderId: res.orderId,
            razorpayOrderId: res.payment?.providerOrderId || 'order_test_mock',
            razorpayPaymentId: 'pay_test_' + Date.now(),
            razorpaySignature: 'test_signature'
          }).subscribe({
            next: () => {
              void this.router.navigate(['/payment/result'], {
                queryParams: {
                  orderId: res.orderId,
                  orderNumber: res.orderNumber,
                  status: 'success'
                }
              });
            },
            error: () => {
              void this.router.navigate(['/payment/result'], {
                queryParams: {
                  orderId: res.orderId,
                  orderNumber: res.orderNumber,
                  status: 'success'
                }
              });
            }
          });
        }
      },
      error: err => {
        this.isPlacingOrder.set(false);
        this.errorMessage.set(err?.error?.message || 'Could not complete checkout. Please verify items and try again.');
=======
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
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
      }
    });
  }
}
