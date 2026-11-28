import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PagedResponse,
  ProductDetailsDto,
  ProductListItemDto
} from '../../models/product.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {

  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(
    page: number = 1,
    pageSize: number = 12,
    search: string = '',
    categoryId?: number
  ): Observable<PagedResponse<ProductListItemDto>> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    if (categoryId !== undefined) {
      params = params.set('categoryId', categoryId);
    }

    return this.http.get<PagedResponse<ProductListItemDto>>(
      this.apiUrl,
      { params }
    );
  }

  getProductById(productId: number): Observable<ProductDetailsDto> {
    return this.http.get<ProductDetailsDto>(
      `${this.apiUrl}/${productId}`
    );
  }
}