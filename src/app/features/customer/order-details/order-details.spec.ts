import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderApiService } from '../../../core/services/order/order-api';
import { OrderDetails } from './order-details';

describe('OrderDetails', () => {
  let component: OrderDetails;
  let fixture: ComponentFixture<OrderDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: { paramMap: convertToParamMap({ id: '1' }) }
          }
        },
        {
          provide: OrderApiService,
          useValue: {
            getMyOrderById: () => of({
              orderId: 1,
              orderNumber: 'ORD-1',
              customerName: 'Customer',
              items: [],
              deliveryAddress: {
                recipientName: 'Customer',
                phone: '9876543210',
                addressLine1: '12 Main Road',
                city: 'Madurai',
                state: 'Tamil Nadu',
                postalCode: '625001'
              },
              subtotal: 0,
              deliveryFee: 0,
              totalAmount: 0,
              orderStatus: 'Pending',
              paymentStatus: 'Pending',
              createdAtUtc: '2026-11-27T00:00:00Z',
              statusHistory: []
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
