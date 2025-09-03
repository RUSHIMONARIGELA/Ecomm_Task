// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { ProductDTO } from '../models/product.model';
import { Review } from '../models/review.model';

// Interface to match the data structure returned by the Elasticsearch backend
interface ProductElasticsearch {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  stockQuantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  
  private baseUrl = 'http://localhost:8081/api/products';
  private reviewUrl = 'http://localhost:8081/api/reviews';
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
    return this.http.get<ProductDTO>(`${this.baseUrl}/${id}`);
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

  uploadProductsCsv(formData: FormData): Observable<string> {
    return this.http.post(`${this.baseUrl}/upload-csv`, formData, { responseType: 'text' });
  }

  creareMultipleProducts(products: ProductDTO[]): Observable<ProductDTO[]> {
    const headers=this.getAuthHeaders();
    return this.http.post<ProductDTO[]>(`${this.baseUrl}/batch`, products, {headers});
  }

  
  searchProducts(query: string): Observable<ProductDTO[]> {
    let params = new HttpParams().set('query', query);
    
    return this.http.get<ProductElasticsearch[]>(`${this.baseUrl}/search`, { params }).pipe(
      map(elasticProducts => elasticProducts.map(this.mapElasticToDTO))
    );
  }

  private mapElasticToDTO(elasticProduct: ProductElasticsearch): ProductDTO {
    return {
      id: elasticProduct.id ? Number(elasticProduct.id) : undefined,
      name: elasticProduct.name,
      description: elasticProduct.description,
      images: elasticProduct.images,
      price: elasticProduct.price,
      stockQuantity: elasticProduct.stockQuantity,
      categoryName: elasticProduct.category,
    };
  }
  
  getReviewsForProduct(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.reviewUrl}/products/${productId}`);
  }

  submitReview(review: Review): Observable<Review> {
    const headers = this.getAuthHeaders();
    return this.http.post<Review>(this.reviewUrl, review, { headers });
  }
}
