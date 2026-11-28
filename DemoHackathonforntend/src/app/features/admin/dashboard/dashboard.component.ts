import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardApiService } from '../../../core/services/dashboard/admin-dashboard-api';

interface DashboardOrder {
  orderNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardApi = inject(AdminDashboardApiService);

  readonly today = signal(new Date());

  metrics = signal([
    {
      title: 'Total Products',
      value: 0,
      icon: 'bi-box-seam',
      color: 'primary',
      link: '/admin/products'
    },
    {
      title: 'Categories',
      value: 0,
      icon: 'bi-grid',
      color: 'success',
      link: '/admin/categories'
    },
    {
      title: 'Low Stock',
      value: 0,
      icon: 'bi-exclamation-triangle',
      color: 'warning',
      link: '/admin/inventory'
    },
    {
      title: 'Total Orders',
      value: 0,
      icon: 'bi-cart-check',
      color: 'info',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: 0,
      icon: 'bi-clock',
      color: 'danger',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: '₹0',
      icon: 'bi-currency-rupee',
      color: 'success',
      link: '/admin/orders'
    }
  ]);

  recentOrders = signal<DashboardOrder[]>([]);

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.dashboardApi.getDashboardMetrics().subscribe({
      next: data => {
        this.metrics.set([
          {
            title: 'Total Products',
            value: data.totalProducts,
            icon: 'bi-box-seam',
            color: 'primary',
            link: '/admin/products'
          },
          {
            title: 'Categories',
            value: data.categories,
            icon: 'bi-grid',
            color: 'success',
            link: '/admin/categories'
          },
          {
            title: 'Low Stock',
            value: data.lowStock,
            icon: 'bi-exclamation-triangle',
            color: 'warning',
            link: '/admin/inventory'
          },
          {
            title: 'Total Orders',
            value: data.totalOrders,
            icon: 'bi-cart-check',
            color: 'info',
            link: '/admin/orders'
          },
          {
            title: 'Pending Orders',
            value: data.pendingOrders,
            icon: 'bi-clock',
            color: 'danger',
            link: '/admin/orders'
          },
          {
            title: 'Total Revenue',
            value: `₹${data.totalRevenue.toLocaleString()}`,
            icon: 'bi-currency-rupee',
            color: 'success',
            link: '/admin/orders'
          }
        ]);

        this.recentOrders.set((data.recentOrders || []).map(o => ({
          orderNumber: o.orderNumber,
          customerName: o.customerName || 'Customer',
          date: o.createdAtUtc,
          total: o.totalAmount,
          status: o.orderStatus
        })));
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-success';
      case 'processing':
      case 'readyfordispatch':
      case 'confirmed':
        return 'bg-primary';
      case 'pendingpayment':
      case 'placed':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
