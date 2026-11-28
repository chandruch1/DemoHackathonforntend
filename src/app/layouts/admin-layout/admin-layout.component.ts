import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  menuItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
    { label: 'Products', icon: 'bi-box-seam', route: '/admin/products' },
    { label: 'Categories', icon: 'bi-grid', route: '/admin/categories' },
    { label: 'Brands', icon: 'bi-tags', route: '/admin/brands' },
    { label: 'Inventory', icon: 'bi-clipboard-data', route: '/admin/inventory' },
    { label: 'Orders', icon: 'bi-cart-check', route: '/admin/orders' }
  ];

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}