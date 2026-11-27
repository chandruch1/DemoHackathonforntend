import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CartDto } from '../../../core/models/cart.model';
import { CartApiService } from '../../../core/services/cart/cart-api';
import { Cart } from './cart';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartApi: {
    getCart: ReturnType<typeof vi.fn>;
    updateItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clearCart: ReturnType<typeof vi.fn>;
  };

  const cart: CartDto = {
    cartId: 1,
    items: [{
      cartItemId: 4,
      productId: 8,
      productName: 'API product',
      unitPrice: 3.25,
      quantity: 1,
      lineTotal: 3.25,
      availableQuantity: 3
    }],
    itemCount: 1,
    subtotal: 3.25,
    updatedAtUtc: '2026-11-27T09:00:00Z'
  };

  beforeEach(async () => {
    cartApi = {
      getCart: vi.fn().mockReturnValue(of(cart)),
      updateItem: vi.fn().mockReturnValue(of(cart)),
      removeItem: vi.fn().mockReturnValue(of(cart)),
      clearCart: vi.fn().mockReturnValue(of(cart))
    };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        { provide: CartApiService, useValue: cartApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the cart and delegates quantity changes to the backend', () => {
    expect(cartApi.getCart).toHaveBeenCalledOnce();
    expect(component.cart).toEqual(cart);

    component.updateQuantity(cart.items[0], 1);

    expect(cartApi.updateItem).toHaveBeenCalledWith(4, { quantity: 2 });
    expect(component.cart).toEqual(cart);
  });
});
