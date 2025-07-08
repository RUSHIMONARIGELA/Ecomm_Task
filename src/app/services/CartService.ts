import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CartDTO } from '../models/cart-models';

interface AddItemToCartRequestDTO {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:8080/api/carts'; 

  private http= inject(HttpClient)
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

  getOrCreateCart(customerId: number): Observable<CartDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<CartDTO>(`${this.baseUrl}/customer/${customerId}`, { headers });
  }

  addProductToCart(customerId: number, addItemToCartDTO: AddItemToCartRequestDTO): Observable<CartDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<CartDTO>(`${this.baseUrl}/customer/${customerId}/items`, addItemToCartDTO, { headers });
  }

 
  updateProductQuantityInCart(customerId: number, productId: number, newQuantity: number): Observable<CartDTO> {
    const headers = this.getAuthHeaders();
    return this.http.put<CartDTO>(`${this.baseUrl}/customer/${customerId}/items/${productId}?newQuantity=${newQuantity}`, null, { headers });
  }

 
  removeProductFromCart(customerId: number, productId: number): Observable<CartDTO> {
    const headers = this.getAuthHeaders();
    return this.http.delete<CartDTO>(`${this.baseUrl}/customer/${customerId}/items/${productId}`, { headers });
  }

  clearCart(customerId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/customer/${customerId}/clear`, { headers });
  }

  getCartById(cartId: number): Observable<CartDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<CartDTO>(`${this.baseUrl}/id/${cartId}`, { headers });
  }

  
  getCartByCustomerId(customerId: number): Observable<CartDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<CartDTO>(`${this.baseUrl}/customer/${customerId}`, { headers });
  }
}
