import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PaymentStatus = 'success' | 'pending' | 'failed';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css'
})
export class PaymentResult implements OnInit {

  paymentStatus: PaymentStatus = 'pending';

  orderNumber = 'ORD-2026-001';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];

      if (
        status === 'success' ||
        status === 'pending' ||
        status === 'failed'
      ) {
        this.paymentStatus = status;
      }
    });
  }

  get title(): string {
    switch (this.paymentStatus) {
      case 'success':
        return 'Payment Successful!';

      case 'failed':
        return 'Payment Failed';

      default:
        return 'Payment Pending';
    }
  }

  get message(): string {
    switch (this.paymentStatus) {
      case 'success':
        return 'Your payment has been confirmed. Your order is being processed.';

      case 'failed':
        return 'We could not complete your payment. Please try again.';

      default:
        return 'Your payment is awaiting confirmation. Please check again shortly.';
    }
  }
}