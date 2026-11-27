
import { Routes } from '@angular/router';
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
        loadComponent: () =>
          import('./features/customer/cart/cart')
            .then(m => m.Cart)
      },
      {
        path: 'checkout',
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
      loadComponent: () =>
        import('./features/customer/my-orders/my-orders')
          .then(m => m.MyOrders)
    },
    {
      path: 'my-orders/:id',
      loadComponent: () =>
        import('./features/customer/order-details/order-details')
          .then(m => m.OrderDetails)
    },
    {
      path: 'profile',
      loadComponent: () =>
        import('./features/customer/profile/profile')
          .then(m => m.Profile)
    },
    {
      path: 'addresses',
      loadComponent: () =>
        import('./features/customer/address-management/address-management')
          .then(m => m.AddressManagement)
    }
    ]
  }
];
