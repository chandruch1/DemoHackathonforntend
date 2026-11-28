<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
=======
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrderListItemDto } from '../../../core/models/order.model';
import { OrderApiService } from '../../../core/services/order/order-api';
<<<<<<< HEAD
=======
import { getApiErrorMessage } from '../../../core/utils/api-error-message';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {
  private readonly orderApi = inject(OrderApiService);

<<<<<<< HEAD
  orders = signal<OrderListItemDto[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderApi.getMyOrders().subscribe({
      next: data => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your orders.');
        this.isLoading.set(false);
      }
    });
  }
}
=======
  orders: OrderListItemDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly orderApi = inject(OrderApiService);

  constructor() {
    this.loadOrders();
  }

  retry(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderApi.getMyOrders().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: orders => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.orders = [];
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not load your orders. Please try again.'
        );
        this.isLoading = false;
      }
    });
  }
}
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
