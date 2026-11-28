import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ProductApiService } from './product-api';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('fetches a product by ID from the configured API URL', () => {
    const product = {
      productId: 42,
      name: 'Sample response product',
      description: 'Returned by the API in this test',
      categoryId: 3,
      categoryName: 'Category',
      price: 10,
      availableQuantity: 2,
      isActive: true,
      createdAtUtc: '2026-11-27T00:00:00Z'
    };

    service.getProductById(42).subscribe(response => {
      expect(response).toEqual(product);
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/products/42`
    );
    expect(request.request.method).toBe('GET');
    request.flush(product);
  });
});
