import { Routes } from '@angular/router';
import { CustomerLayout } from './layouts/customer-layout/customer-layout';

export const routes: Routes = [
  {
    path: '',
    component: CustomerLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/customer/home/home')
            .then(m => m.Home)
      }
    ]
  }
];