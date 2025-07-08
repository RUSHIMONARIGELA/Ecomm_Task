import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { ProductDTO } from '../../models/product.model';

@Component({
  selector: 'app-public-products-list',
  imports: [CommonModule,
    RouterLink,
    HttpClientModule, 
    DecimalPipe  ],
  templateUrl: './public-products-list.component.html',
  styleUrl: './public-products-list.component.css'
})
export class PublicProductsListComponent {

  products: ProductDTO[] = [];
  loading = true;
  error: string | null = null;

  private productService=inject(ProductService);
  constructor() {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.productService.getAllProducts().subscribe({
      next: (data: ProductDTO[]) => {
        this.products = data;
        this.loading = false;
        console.log('Public Products loaded:', this.products);
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products for public view:', err);
        if (err.error && err.error.message) {
          this.error = `Failed to load products: ${err.error.message}`;
        }
      }
    });
  }
}


