import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PaymentResult } from './payment-result';

describe('PaymentResult', () => {
  let component: PaymentResult;
  let fixture: ComponentFixture<PaymentResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentResult],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
