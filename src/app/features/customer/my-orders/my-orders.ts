import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderListItemDto } from '../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders {

  orders: OrderListItemDto[] = [
    {
      orderId: 1,
      orderNumber: 'ORD-2026-001',
      createdAtUtc: '2026-11-25T10:30:00Z',
      itemCount: 3,
      totalAmount: 507,
      orderStatus: 'Delivered',
      paymentStatus: 'Paid'
    },
    {
      orderId: 2,
      orderNumber: 'ORD-2026-002',
      createdAtUtc: '2026-11-26T12:00:00Z',
      itemCount: 2,
      totalAmount: 399,
      orderStatus: 'Processing',
      paymentStatus: 'Paid'
    },
    {
      orderId: 3,
      orderNumber: 'ORD-2026-003',
      createdAtUtc: '2026-11-27T08:00:00Z',
      itemCount: 1,
      totalAmount: 250,
      orderStatus: 'Confirmed',
      paymentStatus: 'Pending'
    }
  ];

}