
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartDto, CartItemDto } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  // Temporary mock CartDto response
  cart: CartDto = {
    cartId: 1,
    items: [
      {
        cartItemId: 1,
        productId: 1,
        productName: 'Margherita Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=400',
        unitPrice: 199,
        quantity: 2,
        lineTotal: 398,
        availableQuantity: 12
      },
      {
        cartItemId: 2,
        productId: 3,
        productName: 'Fresh Lime Soda',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?w=400',
        unitPrice: 79,
        quantity: 1,
        lineTotal: 79,
        availableQuantity: 15
      }
    ],
    itemCount: 3,
    subtotal: 477,
    updatedAtUtc: '2026-11-27T09:00:00Z'
  };

  updateQuantity(item: CartItemDto, change: number): void {
    const newQuantity = item.quantity + change;

    if (newQuantity < 1 || newQuantity > item.availableQuantity) {
      return;
    }

    item.quantity = newQuantity;

    // Temporary mock behaviour only.
    // The real backend will calculate line totals and subtotal.
    item.lineTotal = item.unitPrice * item.quantity;
    this.cart.itemCount = this.cart.items.reduce(
      (total, current) => total + current.quantity,
      0
    );
    this.cart.subtotal = this.cart.items.reduce(
      (total, current) => total + current.lineTotal,
      0
    );
  }

  removeItem(cartItemId: number): void {
    this.cart.items = this.cart.items.filter(
      item => item.cartItemId !== cartItemId
    );

    this.cart.itemCount = this.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    this.cart.subtotal = this.cart.items.reduce(
      (total, item) => total + item.lineTotal,
      0
    );
  }

  clearCart(): void {
    this.cart.items = [];
    this.cart.itemCount = 0;
    this.cart.subtotal = 0;
  }

}
