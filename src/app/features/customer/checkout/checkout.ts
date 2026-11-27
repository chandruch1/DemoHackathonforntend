import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AddressDto } from '../../../core/models/address.model';
import {
  CheckoutRequest,
  PaymentMethod
} from '../../../core/models/checkout.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {

  addresses: AddressDto[] = [
    {
      addressId: 1,
      recipientName: 'Customer Name',
      phone: '9876543210',
      addressLine1: '12, Main Road',
      addressLine2: 'Near Bus Stand',
      city: 'Madurai',
      state: 'Tamil Nadu',
      postalCode: '625001',
      isDefault: true
    }
  ];

  selectedAddressId = 1;

  paymentMethod: PaymentMethod = 'Razorpay';

  deliveryInstructions = '';

  // Temporary mock values
  subtotal = 477;
  deliveryFee = 30;

  get totalAmount(): number {
    return this.subtotal + this.deliveryFee;
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod = method;
  }

  placeOrder(): void {
    const request: CheckoutRequest = {
      addressId: this.selectedAddressId,
      deliveryInstructions: this.deliveryInstructions || undefined,
      paymentMethod: this.paymentMethod
    };

    console.log('Checkout Request:', request);
  }
}