import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryDto, UpdateInventoryDto } from '../../models/inventory.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminInventoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/admin/inventory`;

  getInventory(search?: string): Observable<InventoryDto[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<InventoryDto[]>(this.baseUrl, { params });
  }

  getProductInventory(productId: number): Observable<InventoryDto> {
    return this.http.get<InventoryDto>(`${this.baseUrl}/${productId}`);
  }

  updateInventory(productId: number, dto: UpdateInventoryDto): Observable<InventoryDto> {
    return this.http.patch<InventoryDto>(`${this.baseUrl}/${productId}`, dto);
  }
}
