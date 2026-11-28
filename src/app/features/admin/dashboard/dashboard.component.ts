import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class DashboardComponent {
  metrics = [
    {
      title: 'Total Products',
      value: 128,
      icon: 'bi-box-seam',
      color: 'primary',
      link: '/admin/products'
    },
    {
      title: 'Categories',
      value: 12,
      icon: 'bi-grid',
      color: 'success',
      link: '/admin/categories'
    },
    {
      title: 'Low Stock',
      value: 8,
      icon: 'bi-exclamation-triangle',
      color: 'warning',
      link: '/admin/inventory'
    },
    {
      title: 'Total Orders',
      value: 245,
      icon: 'bi-cart-check',
      color: 'info',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: 18,
      icon: 'bi-clock',
      color: 'danger',
      link: '/admin/orders'
    }
  ];

  recentOrders: DashboardOrder[] = [
    {
      orderNumber: 'ORD-1048',
      customerName: 'Arun Kumar',
      date: '2026-11-27',
      total: 1250,
      status: 'Pending'
    },
    {
      orderNumber: 'ORD-1047',
      customerName: 'Priya S',
      date: '2026-11-27',
      total: 850,
      status: 'Processing'
    },
    {
      orderNumber: 'ORD-1046',
      customerName: 'Vijay R',
      date: '2026-11-26',
      total: 2100,
      status: 'Delivered'
    },
    {
      orderNumber: 'ORD-1045',
      customerName: 'Karthik M',
      date: '2026-11-26',
      total: 560,
      status: 'Cancelled'
    }
  ];

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'processing':
        return 'bg-info text-dark';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}