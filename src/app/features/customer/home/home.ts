
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  categories = [
    { name: 'Pizza', icon: 'bi bi-egg-fried' },
    { name: 'Cold Drinks', icon: 'bi bi-cup-straw' },
    { name: 'Breads', icon: 'bi bi-basket' }
  ];

  featuredProducts = [
    { name: 'Margherita Pizza', price: 199, category: 'Pizza' },
    { name: 'Fresh Lime Soda', price: 79, category: 'Cold Drinks' },
    { name: 'Garlic Bread', price: 129, category: 'Breads' }
  ];
}
