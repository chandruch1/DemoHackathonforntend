import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { OrderDetailsDto } from '../../../core/models/order.model';
import { OrderApiService } from '../../../core/services/order/order-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

type OrderDetailsLoadResult =
  | { kind: 'invalid' }
  | { kind: 'success'; order: OrderDetailsDto }
  | { kind: 'error'; error: HttpErrorResponse };

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);

  orderId = signal<number | null>(null);
  order = signal<OrderDetailsDto | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      switchMap(orderId => {
        const validId = Number.isInteger(orderId) && orderId > 0 ? orderId : null;
        this.orderId.set(validId);
        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.order.set(null);
        if (validId === null) return of({ kind: 'invalid' } satisfies OrderDetailsLoadResult);

        return this.orderApi.getMyOrderById(validId).pipe(
          map(order => ({ kind: 'success', order }) satisfies OrderDetailsLoadResult),
          catchError((error: HttpErrorResponse) =>
            of({ kind: 'error', error } satisfies OrderDetailsLoadResult)
          )
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.isLoading.set(false);
      if (result.kind === 'invalid') {
        this.errorMessage.set('The requested order is not valid.');
      } else if (result.kind === 'error') {
        this.errorMessage.set(getApiErrorMessage(result.error, 'We could not load this order. Please try again.'));
      } else {
        this.order.set(result.order);
      }
    });
  }

  retry(): void {
    const orderId = this.orderId();
    if (orderId === null) {
      this.errorMessage.set('The requested order is not valid.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.orderApi.getMyOrderById(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: order => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getApiErrorMessage(error, 'We could not load this order. Please try again.'));
        this.isLoading.set(false);
      }
    });
  }
}
