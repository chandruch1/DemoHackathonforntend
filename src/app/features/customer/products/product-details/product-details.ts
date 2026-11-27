
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductDetailsDto } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails {

  quantity = 1;

  // Temporary mock data matching ProductDetailsDto
  product: ProductDetailsDto = {
    productId: 1,
    name: 'Margherita Pizza',
    description: 'A delicious classic pizza topped with fresh tomato sauce, mozzarella cheese and aromatic herbs.',
    categoryId: 1,
    categoryName: 'Pizza',
    brandName: 'RetailStore',
    packagingInfo: 'Delivered in a secure food-grade pizza box.',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900',
    availableQuantity: 12,
    isActive: true,
    createdAtUtc: '2026-11-27T09:00:00Z'
  };

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.product = {
      ...this.product,
      productId: id
    };
  }

  increaseQuantity(): void {
    if (this.quantity < this.product.availableQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

}
