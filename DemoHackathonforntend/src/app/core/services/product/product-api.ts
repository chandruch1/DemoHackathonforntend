import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminProductUpsertDto,
  PagedResponse,
  ProductDetailsDto,
  ProductListItemDto,
  UpdateActiveStatusDto
} from '../../models/product.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/products`;
  private readonly adminBaseUrl = `${environment.apiUrl.replace(/\/$/, '')}/admin/products`;

  getProducts(
    page: number = 1,
    pageSize: number = 12,
    search: string = '',
    categoryId?: number,
    brandId?: number,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string
  ): Observable<PagedResponse<ProductListItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    if (categoryId !== undefined && categoryId > 0) {
      params = params.set('categoryId', categoryId.toString());
    }
    if (brandId !== undefined && brandId > 0) {
      params = params.set('brandId', brandId.toString());
    }
    if (minPrice !== undefined) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params = params.set('maxPrice', maxPrice.toString());
    }
    if (sortBy?.trim()) {
      params = params.set('sortBy', sortBy.trim());
    }

    return this.http.get<PagedResponse<ProductListItemDto>>(this.baseUrl, { params });
  }

  getProductById(productId: number): Observable<ProductDetailsDto> {
    return this.http.get<ProductDetailsDto>(`${this.baseUrl}/${productId}`);
  }

  getAdminProducts(search?: string, categoryId?: number, brandId?: number): Observable<ProductDetailsDto[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    if (categoryId !== undefined && categoryId > 0) params = params.set('categoryId', categoryId.toString());
    if (brandId !== undefined && brandId > 0) params = params.set('brandId', brandId.toString());

    return this.http.get<ProductDetailsDto[]>(this.adminBaseUrl, { params });
  }

  getAdminProductById(productId: number): Observable<ProductDetailsDto> {
    return this.http.get<ProductDetailsDto>(`${this.adminBaseUrl}/${productId}`);
  }

  createProduct(dto: AdminProductUpsertDto): Observable<ProductDetailsDto> {
    return this.http.post<ProductDetailsDto>(this.adminBaseUrl, dto);
  }

  updateProduct(id: number, dto: AdminProductUpsertDto): Observable<ProductDetailsDto> {
    return this.http.put<ProductDetailsDto>(`${this.adminBaseUrl}/${id}`, dto);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBaseUrl}/${id}`);
  }

  updateActiveStatus(id: number, dto: UpdateActiveStatusDto): Observable<void> {
    return this.http.patch<void>(`${this.adminBaseUrl}/${id}/active-status`, dto);
  }
}