import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDto, CategoryUpsertDto } from '../../models/category.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/categories`;
  private readonly adminUrl = `${environment.apiUrl.replace(/\/$/, '')}/admin/categories`;

  getCategories(activeOnly: boolean = false): Observable<CategoryDto[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<CategoryDto[]>(this.baseUrl, { params });
  }

  getAdminCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.adminUrl);
  }

  getCategoryById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.adminUrl}/${id}`);
  }

  createCategory(dto: CategoryUpsertDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.adminUrl, dto);
  }

  updateCategory(id: number, dto: CategoryUpsertDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.adminUrl}/${id}`, dto);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
