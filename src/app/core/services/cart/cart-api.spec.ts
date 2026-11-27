import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { CartApiService } from './cart-api';

describe('CartApiService', () => {
  let service: CartApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CartApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('adds an item through the documented endpoint and reloads the server cart', () => {
    const requestBody = { productId: 8, quantity: 2 };
    const cartResponse = {
      cartId: 1,
      items: [],
      itemCount: 0,
      subtotal: 0,
      updatedAtUtc: '2026-11-27T09:00:00Z'
    };

    service.addItem(requestBody).subscribe(cart => {
      expect(cart).toEqual(cartResponse);
    });

    const addRequest = httpTestingController.expectOne(`${environment.apiUrl}/cart/items`);
    expect(addRequest.request.method).toBe('POST');
    expect(addRequest.request.body).toEqual(requestBody);
    addRequest.flush(null, { status: 204, statusText: 'No Content' });

    const reloadRequest = httpTestingController.expectOne(`${environment.apiUrl}/cart`);
    expect(reloadRequest.request.method).toBe('GET');
    reloadRequest.flush(cartResponse);
  });

  it('updates item quantity using the item-specific endpoint and reloads server totals', () => {
    service.updateItem(4, { quantity: 3 }).subscribe();

    const updateRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/cart/items/4`
    );
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({ quantity: 3 });
    updateRequest.flush(null, { status: 204, statusText: 'No Content' });

    httpTestingController.expectOne(`${environment.apiUrl}/cart`).flush({
      cartId: 1,
      items: [],
      itemCount: 0,
      subtotal: 0,
      updatedAtUtc: '2026-11-27T09:00:00Z'
    });
  });
});
