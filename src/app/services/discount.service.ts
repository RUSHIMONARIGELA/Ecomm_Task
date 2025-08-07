import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DiscountDTO {
  id?: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'; 
  value: number; 
  minOrderAmount?: number; 
  startDate: string; 
  endDate: string; 
  usageLimit?: number;
  usedCount?: number; 
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private apiUrl = 'http://localhost:8081/api/discounts';

  constructor(private http: HttpClient) { }

  createDiscount(discount: DiscountDTO): Observable<DiscountDTO> {
    return this.http.post<DiscountDTO>(this.apiUrl, discount);
  }

  getDiscountById(id: number): Observable<DiscountDTO> {
    return this.http.get<DiscountDTO>(`${this.apiUrl}/${id}`);
  }

  getAllDiscounts(): Observable<DiscountDTO[]> {
    return this.http.get<DiscountDTO[]>(this.apiUrl);
  }

  
  updateDiscount(id: number, discount: DiscountDTO): Observable<DiscountDTO> {
    return this.http.put<DiscountDTO>(`${this.apiUrl}/${id}`, discount);
  }

  
  deleteDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
