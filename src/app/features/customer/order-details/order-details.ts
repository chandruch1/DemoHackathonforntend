import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
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

  order: OrderDetailsDto | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);
  private orderId: number | null = null;

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      switchMap(orderId => {
        this.orderId = Number.isInteger(orderId) && orderId > 0
          ? orderId
          : null;
        this.isLoading = true;
        this.errorMessage = null;
        this.order = null;

        if (!Number.isInteger(orderId) || orderId <= 0) {
          return of({ kind: 'invalid' } satisfies OrderDetailsLoadResult);
        }

        return this.orderApi.getMyOrderById(orderId).pipe(
          map(order => ({ kind: 'success', order }) satisfies OrderDetailsLoadResult),
          catchError((error: HttpErrorResponse) =>
            of({ kind: 'error', error } satisfies OrderDetailsLoadResult)
          )
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.isLoading = false;

      if (result.kind === 'invalid') {
        this.errorMessage = 'The requested order is not valid.';
      } else if (result.kind === 'error') {
        this.errorMessage = getApiErrorMessage(
          result.error,
          'We could not load this order. Please try again.'
        );
      } else {
        this.order = result.order;
      }
    });
  }

  retry(): void {
    if (this.orderId === null) {
      this.errorMessage = 'The requested order is not valid.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.order = null;
    this.orderApi.getMyOrderById(this.orderId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: order => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not load this order. Please try again.'
        );
        this.isLoading = false;
      }
    });
  }
}