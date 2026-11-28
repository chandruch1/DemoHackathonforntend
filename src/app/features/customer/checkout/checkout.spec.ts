import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AddressApiService } from '../../../core/services/address/address-api';
import { CartApiService } from '../../../core/services/cart/cart-api';
import { OrderApiService } from '../../../core/services/order/order-api';
import { Checkout } from './checkout';

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [
        provideRouter([]),
        {
          provide: AddressApiService,
          useValue: { getAddresses: () => of([]) }
        },
        {
          provide: CartApiService,
          useValue: {
            getCart: () => of({
              cartId: 1,
              items: [],
              itemCount: 0,
              subtotal: 0,
              updatedAtUtc: '2026-11-27T00:00:00Z'
            })
          }
        },
        { provide: OrderApiService, useValue: { checkout: () => of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
