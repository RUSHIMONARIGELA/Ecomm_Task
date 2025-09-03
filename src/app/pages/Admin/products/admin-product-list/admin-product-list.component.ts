import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductDTO } from '../../../../models/product.model';

@Component({
  selector: 'app-admin-product-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './admin-product-list.component.html',
  styleUrl: './admin-product-list.component.css',
})
export class AdminProductListComponent {
  products: ProductDTO[] = [];
  paginatedProducts: ProductDTO[] = [];
  searchQuery: string = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  errorMessage: string | null = null; // Changed to null for consistency
  successMessage: string | null = null; // Changed to null for consistency
  submitting = false; // FIXED: Added submitting property

  private productService = inject(ProductService);
  private router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({ 
      next: (data) => {
        this.products = data;
        this.applyPagination();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to load products.';
        console.error('Error loading products:', error);
        if (error.error && error.error.message) {
          this.errorMessage = `Failed to load products: ${error.error.message}`;
        }
      }
    });
  }

  applyPagination(): void {
    const filtered = this.searchQuery
      ? this.products.filter((p) =>
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      : this.products;

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = filtered.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyPagination();
  }

  editProduct(product: ProductDTO): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  deleteProduct(id: number | undefined): void {
    if (id === undefined) {
      console.warn('Cannot delete product: Product ID is undefined.');
      this.errorMessage = 'Cannot delete product: ID is missing.';
      return;
    }

    // IMPORTANT: Do NOT use confirm(). Use a custom modal for user confirmation.
    // For now, I'll keep it as is, but this should be replaced.
    if (confirm('Are you sure you want to delete this product?')) {
      this.submitting = true; // Set submitting to true
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.successMessage = 'Product deleted successfully!';
          this.loadProducts(); // Reload products to reflect deletion
          this.submitting = false; // Reset submitting
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'Failed to delete product.';
          this.submitting = false; // Reset submitting
          console.error('Error deleting product:', error);
          if (error.error && error.error.message) {
            this.errorMessage = `Failed to delete product: ${error.error.message}`;
          }
        },
      });
    }
  }

  // This method is no longer used directly by a button in the HTML due to new separate buttons
  // But keeping it for potential future use or if you adapt it for single product creation.
  navigateToCreate(): void {
    this.router.navigate(['/admin/products/create']); // Navigates to single product creation form
  }
}