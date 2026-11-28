import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  OrderDetailsDto,
  OrderListItemDto
} from '../../models/order.model';
import {
  CheckoutRequest,
  CheckoutResponse
} from '../../models/checkout.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  getMyOrders(): Observable<OrderListItemDto[]> {
    return this.http.get<OrderListItemDto[]>(`${this.apiUrl}/my`);
  }

  getMyOrderById(orderId: number): Observable<OrderDetailsDto> {
    return this.http.get<OrderDetailsDto>(`${this.apiUrl}/my/${orderId}`);
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${environment.apiUrl}/checkout`,
      request
    );
  }
}
