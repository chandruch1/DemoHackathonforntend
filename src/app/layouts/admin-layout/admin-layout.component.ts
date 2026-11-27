import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
    { label: 'Products', icon: 'bi-box-seam', route: '/admin/products' },
    { label: 'Categories', icon: 'bi-grid', route: '/admin/categories' },
    { label: 'Brands', icon: 'bi-tags', route: '/admin/brands' },
    { label: 'Inventory', icon: 'bi-clipboard-data', route: '/admin/inventory' },
    { label: 'Orders', icon: 'bi-cart-check', route: '/admin/orders' }
  ];
}