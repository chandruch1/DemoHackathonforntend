import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CheckoutRequest,
  CheckoutResponse
} from '../../models/checkout.model';
import {
  OrderDetailsDto,
  OrderListItemDto,
  UpdateOrderStatusRequest
} from '../../models/order.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  getMyOrders(): Observable<OrderListItemDto[]> {
    return this.http.get<OrderListItemDto[]>(`${this.baseUrl}/orders/my`);
  }

  getMyOrderById(orderId: number): Observable<OrderDetailsDto> {
    return this.http.get<OrderDetailsDto>(`${this.baseUrl}/orders/my/${orderId}`);
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.baseUrl}/checkout`, request);
  }

  getAdminOrders(status = '', search = ''): Observable<OrderListItemDto[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<OrderListItemDto[]>(`${this.baseUrl}/admin/orders`, { params });
  }

  getAdminOrderById(orderId: number): Observable<OrderDetailsDto> {
    return this.http.get<OrderDetailsDto>(`${this.baseUrl}/admin/orders/${orderId}`);
  }

  updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<OrderDetailsDto> {
    return this.http.patch<OrderDetailsDto>(
      `${this.baseUrl}/admin/orders/${orderId}/status`,
      request
    );
  }
}