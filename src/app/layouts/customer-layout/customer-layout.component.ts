import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ProductDTO } from '../../models/product.model';

@Component({
  selector: 'app-customer-layout',
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.css',
})
export class CustomerLayoutComponent {
  featuredProducts: ProductDTO[] = [];
  loadingProducts = true;
  productsError: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }
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
      error: (error) => {
        this.productsError = 'Failed to load products. Please try again later.';
        this.loadingProducts = false;
        console.error('Error fetching public products:', error);
      },
    });
  }

  viewProductDetails(productId: number | undefined): void {
    if (productId !== undefined) {
      this.router.navigate(['/products', productId]);
    } else {
      console.warn('Cannot view product details: Product ID is undefined.');
    }
  }
   navigateTo(url: string): void {
    this.router.navigate([url]);
  }
}
