
export type PaymentMethod = 'Razorpay' | 'CashOnDelivery';

export interface CheckoutRequest {
  addressId: number;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResponse {
  orderId: number;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency: 'INR';
  paymentStatus: string;
  orderStatus: string;
  payment?: PaymentInitiationDto;
}

export interface PaymentInitiationDto {
  provider: 'Razorpay';
  providerOrderId: string;
  amount: number;
  currency: 'INR';
  razorpayKeyId: string;
}


