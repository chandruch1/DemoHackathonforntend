export interface InventoryDto {
  inventoryId: number;
  productId: number;
  productName: string;
  categoryName: string;
  availableQuantity: number;
  updatedAtUtc: string;
}

export interface UpdateInventoryDto {
  stockChange: number;
  changeType: 'add' | 'reduce' | 'set';
}
