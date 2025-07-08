import { Component, inject, OnInit } from '@angular/core'; 
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router'; 
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; 

import { AuthService } from '../../../services/auth.service';

import { OrderService } from '../../../services/order.service';
import { OrderDTO } from '../../../models/order-models';


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    DecimalPipe 
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'] 
})
export class OrdersComponent implements OnInit { 

  orders: OrderDTO[] = [];
  loadingOrders = true;
  ordersError: string | null = null;

  private orderService=inject(OrderService);
    private authService=inject(AuthService);
    private router=inject(Router)
  constructor(
    
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.ordersError = null;
    const customerId = this.authService.getCurrentCustomerId(); 

    if (customerId) {
      this.orderService.getOrdersByCustomerId(customerId).subscribe({
        next: (data: OrderDTO[]) => {

          this.orders = data;
          this.loadingOrders = false;
        },
        error: (error: HttpErrorResponse) => {
          this.ordersError = 'Failed to load orders. Please try again.';
          this.loadingOrders = false;
          console.error('OrdersComponent: Error fetching orders:', error);
          if (error.status === 404) {
            this.ordersError = 'No orders found for this customer.';
          } else if (error.error && error.error.message) {
            this.ordersError = `Failed to load orders: ${error.error.message}`;
          }
        }
      });
    } else {
      this.ordersError = 'Customer ID not available. Please log in.';
      this.loadingOrders = false;
      console.warn('OrdersComponent: No customer ID found from AuthService. Cannot load orders.');
      this.router.navigate(['/login']); 
    }
  }

  viewOrderDetails(orderId: number | undefined): void {
    if (orderId !== undefined) {
      this.router.navigate(['/home/orders', orderId]); 
    } else {
      console.warn('Cannot view order details: Order ID is undefined.');
    }
  }
}
