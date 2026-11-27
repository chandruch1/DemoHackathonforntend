import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CheckoutRequest } from '../../models/checkout.model';
import { environment } from '../../../../environments/environment';
import { OrderApiService } from './order-api';

describe('OrderApiService', () => {
  let service: OrderApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OrderApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('fetches the signed-in customer order list', () => {
    service.getMyOrders().subscribe(response => {
      expect(response).toEqual([]);
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/orders/my`
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('fetches an order detail through the customer-scoped endpoint', () => {
    service.getMyOrderById(17).subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/orders/my/17`
    );
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('submits checkout without a customer ID', () => {
    const checkoutRequest: CheckoutRequest = {
      addressId: 6,
      paymentMethod: 'CashOnDelivery'
    };

    service.checkout(checkoutRequest).subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/checkout`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(checkoutRequest);
    request.flush({
      orderId: 17,
      orderNumber: 'ORD-17',
      subtotal: 100,
      deliveryFee: 0,
      totalAmount: 100,
      currency: 'INR',
      paymentStatus: 'Pending',
      orderStatus: 'Pending'
    });
  });
});
