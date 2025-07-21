import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ProductDTO } from '../models/product.model';

interface BulkUploadResultDTO {
  totalProcessed: number;
  addedCount: number;
  skippedCount: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  
  private baseUrl = 'http://localhost:8080/api/products';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {}

  private getAuthHeaders(): HttpHeaders {
    const accessToken = this.authService.getToken();
    if (!accessToken) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
  }

  getAllProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(this.baseUrl);
  }

  getProductById(id: number): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.baseUrl}/${id}` );
  }

  createProduct(product: ProductDTO): Observable<ProductDTO> {
    const headers = this.getAuthHeaders();
    return this.http.post<ProductDTO>(this.baseUrl, product, { headers });
  }

  updateProduct(id: number, product: ProductDTO): Observable<ProductDTO> {
    const headers = this.getAuthHeaders();
    return this.http.put<ProductDTO>(`${this.baseUrl}/${id}`, product, {
      headers,
    });
  }

  deleteProduct(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

  getProductsByCategoryId(categoryId: number): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(
      `${this.baseUrl}/category/${categoryId}`
    );
  }


  uploadProductsCsv(formData: FormData): Observable<BulkUploadResultDTO>{
    return this.http.post<BulkUploadResultDTO>(`${this.baseUrl}/upload-csv`, formData);
  }

  creareMultipleProducts(products: ProductDTO[]): Observable<ProductDTO[]> {
    const headers=this.getAuthHeaders();
    return this.http.post<ProductDTO[]>(`${this.baseUrl}/batch`, products,{headers});
  }

}
