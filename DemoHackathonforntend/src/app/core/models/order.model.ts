export interface OrderListItemDto {
  orderId: number;
  orderNumber: string;
  customerName?: string;
  createdAtUtc: string;
  itemCount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AddressSnapshotDto {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderStatusHistoryDto {
  oldStatus?: string;
  newStatus: string;
  changedAtUtc: string;
  changedByName: string;
  note?: string;
}

export interface OrderDetailsDto {
  orderId: number;
  orderNumber: string;
  customerName: string;
  items: OrderItemDto[];
  deliveryAddress: AddressSnapshotDto;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAtUtc: string;
  statusHistory: OrderStatusHistoryDto[];
}

export interface UpdateOrderStatusRequest {
  newStatus: string;
  note?: string;
}
