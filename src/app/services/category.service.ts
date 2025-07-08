// src/app/services/category.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDTO } from '../models/category-models'; // Import the new CategoryDTO
import { AuthService } from './auth.service'; // Assuming AuthService is available

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api/categories';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() { }

  private getAuthHeaders(): HttpHeaders {
    const accessToken = this.authService.getToken();
    if (!accessToken) {
      // For public endpoints (like getAllCategories), token might not be strictly needed.
      // For admin-only endpoints (create, update, delete), it is.
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  getAllCategories(): Observable<CategoryDTO[]> {
    // This endpoint is public on the backend
    return this.http.get<CategoryDTO[]>(this.baseUrl);
  }

  getCategoryById(id: number): Observable<CategoryDTO> {
    const headers = this.getAuthHeaders(); // Admin only on backend
    return this.http.get<CategoryDTO>(`${this.baseUrl}/${id}`, { headers });
  }

  createCategory(category: CategoryDTO): Observable<CategoryDTO> {
    const headers = this.getAuthHeaders(); // Admin only on backend
    return this.http.post<CategoryDTO>(this.baseUrl, category, { headers });
  }

  updateCategory(id: number, category: CategoryDTO): Observable<CategoryDTO> {
    const headers = this.getAuthHeaders(); // Admin only on backend
    return this.http.put<CategoryDTO>(`${this.baseUrl}/${id}`, category, { headers });
  }

  deleteCategory(id: number): Observable<void> {
    const headers = this.getAuthHeaders(); // Admin only on backend
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }
}
