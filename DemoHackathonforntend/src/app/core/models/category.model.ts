export interface CategoryDto {
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}

export interface CategoryUpsertDto {
  name: string;
  description?: string;
  isActive: boolean;
}
