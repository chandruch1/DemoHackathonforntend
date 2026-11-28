import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CartApiService } from '../../../../core/services/cart/cart-api';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { AuthService } from '../../../../core/auth/auth';
import { ProductDetails } from './product-details';

describe('ProductDetails', () => {
  let component: ProductDetails;
  let fixture: ComponentFixture<ProductDetails>;
  let productApi: { getProductById: ReturnType<typeof vi.fn> };
  let cartApi: { addItem: ReturnType<typeof vi.fn> };
  let authService: { isAuthenticated: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    cartApi = {
      addItem: vi.fn().mockReturnValue(of({
        cartId: 1,
        items: [],
        itemCount: 0,
        subtotal: 0,
        updatedAtUtc: '2026-11-27T09:00:00Z'
      }))
    };
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
    authService = { isAuthenticated: vi.fn().mockReturnValue(true) };

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '42' })) }
        },
        { provide: ProductApiService, useValue: productApi },
        { provide: CartApiService, useValue: cartApi },
        { provide: AuthService, useValue: authService }
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
    expect(component.product()?.productId).toBe(42);
  });

  it('adds an in-stock product using the selected quantity', () => {
    component.quantity.set(2);
    component.addToCart();

    expect(cartApi.addItem).toHaveBeenCalledWith({
      productId: 42,
      quantity: 2
    });
    expect(component.cartMessage()).toBe('Returned product added to your cart.');
  });
});
