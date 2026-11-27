export interface ProductListItemDto {
  productId: number;
  name: string;
  shortDescription?: string;
  categoryId: number;
  categoryName: string;
  brandName?: string;
  price: number;
  imageUrl?: string;
  availableQuantity: number;
  isAvailable: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}