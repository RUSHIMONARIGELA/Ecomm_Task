import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrderDTO } from '../../../models/order-models';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, HttpClientModule, DecimalPipe],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent {
  orders: OrderDTO[] = [];
  loadingOrders = true;
  ordersError: string | null = null;
  submitting = false;

  private orderService = inject(OrderService);
  private router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loadingOrders = true;
    this.ordersError = null;
    this.orderService.getAllOrders().subscribe({
      next: (data: OrderDTO[]) => {
        this.orders = data;
        this.loadingOrders = false;
      },
      error: (error: HttpErrorResponse) => {
        this.ordersError = 'Failed to load orders. Please try again.';
        this.loadingOrders = false;
        console.error(
          'AdminOrderListComponent: Error fetching all orders:',
          error
        );
        if (error.error && error.error.message) {
          this.ordersError = `Failed to load orders: ${error.error.message}`;
        }
      },
    });
  }

  editOrder(orderId: number | undefined): void {
    if (orderId !== undefined) {
      this.router.navigate(['/admin/orders/edit', orderId]);
    } else {
      console.warn('Cannot edit order: Order ID is undefined.');
    }
  }

  viewOrderDetails(orderId: number | undefined): void {
    if (orderId !== undefined) {
      this.router.navigate(['/admin/orders', orderId]);
    } else {
      console.warn('Cannot view order details: Order ID is undefined.');
    }
  }

  deleteOrder(orderId: number | undefined): void {
    if (orderId === undefined) {
      console.warn('Cannot delete order: Order ID is undefined.');
      this.ordersError = 'Error: Order ID is missing for deletion.';
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this order? This action cannot be undone.'
      )
    ) {
      return;
    }

    this.submitting = true;
    this.ordersError = null;

    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        console.log('Order deleted successfully:', orderId);
        this.submitting = false;
        this.loadAllOrders();
      },
      error: (error: HttpErrorResponse) => {
        this.ordersError = 'Failed to delete order.';
        this.submitting = false;
        console.error('AdminOrderListComponent: Error deleting order:', error);
        if (error.error && error.error.message) {
          this.ordersError = `Failed to delete order: ${error.error.message}`;
        }
      },
    });
  }
}
