import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrderListItemDto } from '../../../core/models/order.model';
import { OrderApiService } from '../../../core/services/order/order-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders {

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