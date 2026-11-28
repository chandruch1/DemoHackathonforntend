import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BrandDto, BrandUpsertDto } from '../../models/brand.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/brands`;
  private readonly adminUrl = `${environment.apiUrl.replace(/\/$/, '')}/admin/brands`;

  getBrands(activeOnly: boolean = false): Observable<BrandDto[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<BrandDto[]>(this.baseUrl, { params });
  }

  getAdminBrands(): Observable<BrandDto[]> {
    return this.http.get<BrandDto[]>(this.adminUrl);
  }

  getBrandById(id: number): Observable<BrandDto> {
    return this.http.get<BrandDto>(`${this.adminUrl}/${id}`);
  }

  createBrand(dto: BrandUpsertDto): Observable<BrandDto> {
    return this.http.post<BrandDto>(this.adminUrl, dto);
  }

  updateBrand(id: number, dto: BrandUpsertDto): Observable<BrandDto> {
    return this.http.put<BrandDto>(`${this.adminUrl}/${id}`, dto);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
