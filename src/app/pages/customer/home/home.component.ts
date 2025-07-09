import { Component, inject, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; 
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { ProductDTO } from '../../../models/product.model';


@Component({
  selector: 'app-home', 
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    HttpClientModule,
  ],
  templateUrl: './home.component.html', 
  styleUrls: ['./home.component.css'] 
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  featuredProducts: ProductDTO[] = []; 
  loadingProducts = true;
  productsError: string | null = null;

  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.username = this.authService.getCurrentUsername();
    this.fetchFeaturedProducts();
  }

  fetchFeaturedProducts(): void {
    this.loadingProducts = true;
    this.productsError = null;
    
    this.productService.getAllProducts().subscribe({
      next: (products: ProductDTO[]) => { 
        this.featuredProducts = products.slice(0, 4);
        this.loadingProducts = false;
      },
      error: (error: HttpErrorResponse) => { 
        this.productsError = 'Failed to load products. Please try again later.';
        this.loadingProducts = false;
        console.error('Error fetching featured products for customer home:', error);
        if (error.error && error.error.message) {
          this.productsError = `Failed to load products: ${error.error.message}`;
        }
      }
    });
  }

  viewProductDetails(productId: number | undefined): void {
    if (productId !== undefined) {
      this.router.navigate(['/home/products', productId]);
    } else {
      console.warn('Cannot view product details: Product ID is undefined.');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
