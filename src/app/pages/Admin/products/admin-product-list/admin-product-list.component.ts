import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductDTO } from '../../../../models/product.model';

@Component({
  selector: 'app-admin-product-list',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule],
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
  errorMessage = '';
  successMessage ='';

  private productService=inject(ProductService);
  private router=inject(Router);
  constructor() {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe((data) => {
      this.products = data;
      this.applyPagination();
    });
  }

  applyPagination(): void {
    const filtered = this.searchQuery
      ? this.products.filter((p) =>
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      : this.products;

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
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

    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.successMessage = 'Product deleted successfully!';
          this.loadProducts(); 
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'Failed to delete product.';
          console.error('Error deleting product:', error);
          if (error.error && error.error.message) {
            this.errorMessage = `Failed to delete product: ${error.error.message}`;
          }
        }
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/products/create']);
  }
}
