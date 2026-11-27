import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderDetailsDto } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {

  orderId!: number;

  order!: OrderDetailsDto;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));

    // Temporary mock order data
    this.order = {
      orderId: this.orderId,
      orderNumber: 'ORD-2026-001',
      customerName: 'Customer Name',

      items: [
        {
          productId: 1,
          productName: 'Margherita Pizza',
          unitPrice: 199,
          quantity: 2,
          lineTotal: 398
        },
        {
          productId: 2,
          productName: 'Fresh Lime Soda',
          unitPrice: 79,
          quantity: 1,
          lineTotal: 79
        }
      ],

      deliveryAddress: {
        recipientName: 'Customer Name',
        phone: '9876543210',
        addressLine1: '12, Main Road',
        addressLine2: 'Near Bus Stand',
        city: 'Madurai',
        state: 'Tamil Nadu',
        postalCode: '625001'
      },

      subtotal: 477,
      deliveryFee: 30,
      totalAmount: 507,

      orderStatus: 'Processing',
      paymentStatus: 'Paid',
      createdAtUtc: '2026-11-25T10:30:00Z',

      statusHistory: [
        {
          oldStatus: 'Pending',
          newStatus: 'Confirmed',
          changedAtUtc: '2026-11-25T10:35:00Z',
          changedByName: 'Admin',
          note: 'Order confirmed'
        },
        {
          oldStatus: 'Confirmed',
          newStatus: 'Processing',
          changedAtUtc: '2026-11-25T11:00:00Z',
          changedByName: 'Admin',
          note: 'Order is being prepared'
        }
      ]
    };
  }
}