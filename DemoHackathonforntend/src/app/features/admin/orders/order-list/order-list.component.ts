import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderListItemDto, OrderDetailsDto } from '../../../../core/models/order.model';
import { OrderApiService } from '../../../../core/services/order/order-api';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  private readonly orderApi = inject(OrderApiService);

  orders = signal<OrderListItemDto[]>([]);
  selectedOrder = signal<OrderDetailsDto | null>(null);
  showDetailsModal = signal(false);

  searchText = signal('');
  selectedStatus = signal('');

  newStatus = signal('');
  statusNote = signal('');
  isUpdating = signal(false);

  readonly statuses = [
    'PendingPayment',
    'Placed',
    'Confirmed',
    'Processing',
    'ReadyForDispatch',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderApi.getAdminOrders(this.selectedStatus(), this.searchText()).subscribe({
      next: data => {
        this.orders.set(data);
      }
    });
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  viewOrderDetails(orderId: number): void {
    this.orderApi.getAdminOrderById(orderId).subscribe({
      next: details => {
        this.selectedOrder.set(details);
        this.newStatus.set(details.orderStatus);
        this.statusNote.set('');
        this.showDetailsModal.set(true);
      },
      error: err => {
        alert(err?.error?.message || 'Could not load order details.');
      }
    });
  }

  closeModal(): void {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  updateStatus(): void {
    const selectedOrder = this.selectedOrder();
    const newStatus = this.newStatus();
    const statusNote = this.statusNote();
    if (!selectedOrder || !newStatus) return;

    this.isUpdating.set(true);
    this.orderApi.updateOrderStatus(selectedOrder.orderId, {
      newStatus,
      note: statusNote?.trim() || undefined
    }).subscribe({
      next: updated => {
        this.selectedOrder.set(updated);
        this.isUpdating.set(false);
        alert('Order status updated successfully.');
        this.loadOrders();
      },
      error: err => {
        this.isUpdating.set(false);
        alert(err?.error?.message || 'Failed to update order status.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-success';
      case 'processing':
      case 'readyfordispatch':
      case 'confirmed':
        return 'bg-primary';
      case 'pendingpayment':
      case 'placed':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
