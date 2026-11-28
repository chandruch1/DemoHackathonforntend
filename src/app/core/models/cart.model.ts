
export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItemDto {
  cartItemId: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableQuantity: number;
}

export interface CartDto {
  cartId: number;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  updatedAtUtc: string;
}
