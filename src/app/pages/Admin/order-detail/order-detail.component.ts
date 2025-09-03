import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderDTO } from '../../../models/order-models';
import { OrderService } from '../../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent {
  orderId: number | null = null;
  order: OrderDTO | null = null;
  loading = true;
  error: string | null = null;
  submitting = false;

  orderStatuses: string[] = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'PAID'
  ];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  constructor() {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.orderId)) {
      this.error = 'Invalid Order ID provided.';
      this.loading = false;
      return;
    }
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    if (this.orderId === null) return;

    this.loading = true;
    this.error = null;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data: OrderDTO) => {
        this.order = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load order details.';
        this.loading = false;
        console.error('AdminOrderDetailComponent: Error loading order:', err);
        if (err.status === 404) {
          this.error = 'Order not found.';
        } else if (err.error && err.error.message) {
          this.error = `Failed to load order: ${err.error.message}`;
        }
      },
    });
  }

  onUpdateOrder(): void {
    if (this.order === null || this.orderId === null) {
      this.error = 'No order data to update.';
      return;
    }

    this.submitting = true;
    this.error = null;

    this.orderService.updateOrder(this.orderId, this.order).subscribe({
      next: (updatedOrder: OrderDTO) => {
        this.order = updatedOrder; 
        this.submitting = false;
        console.log('Order updated successfully:', updatedOrder);
        this.router.navigate(['/admin/orders']); 
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to update order.';
        this.submitting = false;
        console.error('AdminOrderDetailComponent: Error updating order:', err);
        if (err.error && err.error.message) {
          this.error = `Failed to update order: ${err.error.message}`;
        }
      },
    });
  }
}
