import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { ProductDetails } from './product-details';

describe('ProductDetails', () => {
  let component: ProductDetails;
  let fixture: ComponentFixture<ProductDetails>;
  let productApi: { getProductById: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    productApi = {
      getProductById: vi.fn().mockReturnValue(of({
        productId: 42,
        name: 'Returned product',
        description: 'Product description',
        categoryId: 3,
        categoryName: 'Category',
        price: 10,
        availableQuantity: 2,
        isActive: true,
        createdAtUtc: '2026-11-27T00:00:00Z'
      }))
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '42' })) }
        },
        { provide: ProductApiService, useValue: productApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the product using the route ID', () => {
    expect(productApi.getProductById).toHaveBeenCalledWith(42);
    expect(component.product?.productId).toBe(42);
  });
});
