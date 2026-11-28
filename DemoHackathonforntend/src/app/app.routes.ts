
import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { CustomerLayout } from './layouts/customer-layout/customer-layout';
import { Login } from './features/customer/login/login';
import { Register } from './features/customer/register/register';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(module => module.ADMIN_ROUTES)
  },
  {
    path: '',
    component: CustomerLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/customer/home/home')
            .then(m => m.Home)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/customer/products/product-list/product-list')
            .then(m => m.ProductList)
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/customer/products/product-details/product-details')
            .then(m => m.ProductDetails)
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customer/cart/cart')
            .then(m => m.Cart)
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customer/checkout/checkout')
            .then(m => m.Checkout)
      },
      {
      path: 'payment/result',
      loadComponent: () =>
        import('./features/customer/payment-result/payment-result')
          .then(m => m.PaymentResult)
    },
    {
      path: 'my-orders',
      canActivate: [authGuard],
      loadComponent: () =>
        import('./features/customer/my-orders/my-orders')
          .then(m => m.MyOrders)
    },
    {
      path: 'my-orders/:id',
      canActivate: [authGuard],
      loadComponent: () =>
        import('./features/customer/order-details/order-details')
          .then(m => m.OrderDetails)
    },
    {
      path: 'profile',
      canActivate: [authGuard],
      loadComponent: () =>
        import('./features/customer/profile/profile')
          .then(m => m.Profile)
    },
    {
      path: 'addresses',
      canActivate: [authGuard],
      loadComponent: () =>
        import('./features/customer/address-management/address-management')
          .then(m => m.AddressManagement)
    }
    ]
  },
  { path: '**', redirectTo: '' }
];
