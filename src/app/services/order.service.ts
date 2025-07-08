import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { OrderDTO } from '../models/order-models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:8080/api/orders';

   private http=inject(HttpClient);
   private authService=inject(AuthService);
  constructor() { }

  private getAuthHeaders(): HttpHeaders {
    const accessToken = this.authService.getToken();
    if (!accessToken) {
      throw new Error('Access token not found. User not authenticated.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  getOrdersByCustomerId(customerId: number): Observable<OrderDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<OrderDTO[]>(`${this.baseUrl}/customer/${customerId}`, { headers });
  }

  getOrderById(orderId: number): Observable<OrderDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<OrderDTO>(`${this.baseUrl}/${orderId}`, { headers });
  }

  createOrder(orderDTO: OrderDTO): Observable<OrderDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<OrderDTO>(this.baseUrl, orderDTO, { headers });
  }

  getAllOrders(): Observable<OrderDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<OrderDTO[]>(this.baseUrl, { headers });
  }

  deleteOrder(orderId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${orderId}`, { headers });
  }

  createOrderFromCart(customerId: number): Observable<OrderDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<OrderDTO>(`${this.baseUrl}/from-cart/${customerId}`, null, { headers });
  }

  updateOrder(orderId: number, orderDTO: OrderDTO): Observable<OrderDTO> {
    const headers = this.getAuthHeaders();
    return this.http.put<OrderDTO>(`${this.baseUrl}/${orderId}`, orderDTO, { headers });
  }
}
