import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CustomerDTO, ProfileDTO } from '../models/customer-models'; 

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = 'http://localhost:8080/api/customers';

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

  registerFullCustomer(customerDto: CustomerDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, customerDto);
  }

 
  getCustomerByUserName(userName: string): Observable<CustomerDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<CustomerDTO>(`${this.baseUrl}/username/${userName}`, { headers });
  }

  
  getCustomerById(customerId: number): Observable<CustomerDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<CustomerDTO>(`${this.baseUrl}/${customerId}`, { headers });
  }

  getCustomerProfile(customerId: number): Observable<ProfileDTO> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ProfileDTO>(`${this.baseUrl}/${customerId}/profile`, { headers });
  }

  createOrUpdateCustomerProfile(customerId: number, profileDTO: ProfileDTO): Observable<ProfileDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<ProfileDTO>(`${this.baseUrl}/${customerId}/profile`, profileDTO, { headers });
  }

  
  getAllCustomers(): Observable<CustomerDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CustomerDTO[]>(this.baseUrl, { headers });
  }

  deleteCustomer(customerId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${customerId}`, { headers });
  }
  updateCustomer(customerId: number, customerDTO: CustomerDTO): Observable<CustomerDTO> {
    const headers = this.getAuthHeaders();
    return this.http.put<CustomerDTO>(`${this.baseUrl}/${customerId}`, customerDTO, { headers });
  }
}
