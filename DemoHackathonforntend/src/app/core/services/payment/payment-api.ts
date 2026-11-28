import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RazorpayVerifyRequest {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResultDto {
  orderId: number;
  orderNumber: string;
  isSuccess: boolean;
  paymentStatus: string;
  orderStatus: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/payments`;
  private readonly ordersUrl = `${environment.apiUrl.replace(/\/$/, '')}/orders`;

  verifyRazorpay(request: RazorpayVerifyRequest): Observable<PaymentResultDto> {
    return this.http.post<PaymentResultDto>(`${this.baseUrl}/razorpay/verify`, request);
  }

  getOrderPayment(orderId: number): Observable<PaymentResultDto> {
    return this.http.get<PaymentResultDto>(`${this.ordersUrl}/${orderId}/payment`);
  }
}
