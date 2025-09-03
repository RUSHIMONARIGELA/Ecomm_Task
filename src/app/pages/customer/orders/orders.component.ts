import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../services/auth.service';

import { OrderService } from '../../../services/order.service';
import { OrderDTO } from '../../../models/order-models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
orders: OrderDTO[] = [];
  loadingOrders = true;
  ordersError: string | null = null;
  
  invoiceStatus = {
    downloadingId: null as number | null,
    message: null as string | null
  };

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient); 

  constructor() {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.ordersError = null;
    const customerId = this.authService.getCurrentUserId();

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
        },
      });
    } else {
      this.ordersError = 'Customer ID not available. Please log in.';
      this.loadingOrders = false;
      console.warn(
        'OrdersComponent: No customer ID found from AuthService. Cannot load orders.'
      );
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

  transformDate(dateInput: any): Date | null {
    if (typeof dateInput === 'string') {
      return new Date(dateInput);
    } else if (Array.isArray(dateInput) && dateInput.length >= 3) {
      return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3], dateInput[4], dateInput[5]);
    }
    console.warn('Invalid date format received:', dateInput);
    return null;
  }
  
  downloadInvoice(orderId: number | undefined): void {
    if (orderId === undefined) {
      this.invoiceStatus.message = 'Error: Cannot download invoice, order ID is missing.';
      console.error('Download invoice failed: order ID is undefined.');
      return;
    }

    this.invoiceStatus.downloadingId = orderId;
    this.invoiceStatus.message = `Downloading invoice for Order #${orderId}...`;
    const authToken = this.authService.getToken(); 
    
    
    this.http.get(`http://localhost:8081/api/invoices/generate/${orderId}`, {
      responseType: 'blob', 
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-order-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); 
        
        this.invoiceStatus.downloadingId = null;
        this.invoiceStatus.message = `Invoice for Order #${orderId} downloaded successfully.`;
      },
      error: (err: HttpErrorResponse) => {
        this.invoiceStatus.downloadingId = null;
        this.invoiceStatus.message = `Failed to download invoice: ${err.statusText || 'An unknown error occurred'}`;
        console.error('Failed to download invoice', err);
      }
    });
  }
}
