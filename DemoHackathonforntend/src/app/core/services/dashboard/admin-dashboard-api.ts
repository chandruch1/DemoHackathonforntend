import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderListItemDto } from '../../models/order.model';
import { environment } from '../../../../environments/environment';

export interface DashboardMetricsDto {
  totalProducts: number;
  categories: number;
  lowStock: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: OrderListItemDto[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/admin/dashboard`;

  getDashboardMetrics(): Observable<DashboardMetricsDto> {
    return this.http.get<DashboardMetricsDto>(this.baseUrl);
  }
}
