
import { Routes } from '@angular/router';

import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/product-list/product-list.component')
            .then(m => m.ProductListComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/category-list/category-list.component')
            .then(m => m.CategoryListComponent)
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./brands/brand-list/brand-list.component')
            .then(m => m.BrandListComponent)
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./inventory/inventory-list/inventory-list.component')
            .then(m => m.InventoryListComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/order-list/order-list.component')
            .then(m => m.OrderListComponent)
      }
    ]
  }
];
