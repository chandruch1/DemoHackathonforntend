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


export interface ProductDetailsDto {
  productId: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId?: number;
  brandName?: string;
  packagingInfo?: string;
  price: number;
  imageUrl?: string;
  availableQuantity: number;
  isActive: boolean;
  createdAtUtc: string;
}
