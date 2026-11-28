import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AddCartItemRequest, CartDto, UpdateCartItemRequest } from '../../models/cart.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/cart`;

  getCart(): Observable<CartDto> {
    return this.http.get<CartDto>(this.baseUrl);
  }

  addItem(request: AddCartItemRequest): Observable<CartDto> {
    return this.http.post<CartDto>(`${this.baseUrl}/items`, request).pipe(
      switchMap(() => this.getCart())
    );
  }

  updateItem(cartItemId: number, request: UpdateCartItemRequest): Observable<CartDto> {
    return this.http.put<CartDto>(`${this.baseUrl}/items/${cartItemId}`, request).pipe(
      switchMap(() => this.getCart())
    );
  }

  removeItem(cartItemId: number): Observable<CartDto> {
    return this.http.delete<CartDto>(`${this.baseUrl}/items/${cartItemId}`).pipe(
      switchMap(() => this.getCart())
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.baseUrl);
  }
}