import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PaymentDTO } from '../models/payment-models';
import {
  RazorpayOrderRequestDTO,
  RazorpayOrderResponseDTO,
  RazorpayPaymentCaptureRequestDTO,
} from '../models/razorpay-models';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = 'http://localhost:8081/api/payments';

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  constructor() {}

  private getAuthHeaders(): HttpHeaders {
    const accessToken = this.authService.getToken();
    if (!accessToken) {
      throw new Error('Access token not found. User not authenticated.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
  }

  processPayment(
    orderId: number,
    paymentDTO: PaymentDTO
  ): Observable<PaymentDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<PaymentDTO>(
      `${this.baseUrl}/order/${orderId}`,
      paymentDTO,
      { headers }
    );
  }

  createRazorpayOrder(
    amount: number,
    currency: string,
    receipt: string,
    internalOrderId: number
  ): Observable<RazorpayOrderResponseDTO> {
    const headers = this.getAuthHeaders();
    const requestBody: RazorpayOrderRequestDTO = {
      amount,
      currency,
      receipt,
      internalOrderId,
    };
    return this.http.post<RazorpayOrderResponseDTO>(
      `${this.baseUrl}/razorpay/order`,
      requestBody,
      { headers }
    );
  }

  captureRazorpayPayment(
    captureRequest: RazorpayPaymentCaptureRequestDTO
  ): Observable<PaymentDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<PaymentDTO>(
      `${this.baseUrl}/razorpay/capture`,
      captureRequest,
      { headers }
    );
  }

  getPaymentById(paymentId: number): Observable<PaymentDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<PaymentDTO>(`${this.baseUrl}/${paymentId}`, {
      headers,
    });
  }

  getAllPayments(): Observable<PaymentDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PaymentDTO[]>(this.baseUrl, { headers });
  }

  getPaymentsByOrderId(orderId: number): Observable<PaymentDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PaymentDTO[]>(`${this.baseUrl}/order/${orderId}`, {
      headers,
    });
  }
}
