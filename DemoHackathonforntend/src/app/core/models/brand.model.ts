export interface BrandDto {
  brandId: number;
  name: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}

export interface BrandUpsertDto {
  name: string;
  description?: string;
  isActive: boolean;
}
