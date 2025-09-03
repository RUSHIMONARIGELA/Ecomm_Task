import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { CategoryDTO } from '../../../models/category-models';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin-product-bulk-upload',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './admin-product-bulk-upload.component.html',
  styleUrl: './admin-product-bulk-upload.component.css'
})
export class AdminProductBulkUploadComponent implements OnInit { 
  selectedFile: File | null = null;
  loading = false; 
  errorMessage: string | null = null;
  successMessage: string | null = null;
  categories: CategoryDTO[] = [];

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  ngOnInit(): void { 
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      {
        next: (data: CategoryDTO[]) => {
          this.categories = data;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching categories for bulk upload:', error); 
          this.errorMessage = 'Failed to load categories. Check console for details.'; 
        }
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;
      this.successMessage = null;
    } else {
      this.selectedFile = null;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a CSV file to upload.';
      return;
    }
    if (this.selectedFile.type !== 'text/csv' && !this.selectedFile.name.endsWith('.csv')) {
      this.errorMessage = 'Invalid file type. Please select a CSV File.'; 
      this.selectedFile = null;
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.productService.uploadProductsCsv(formData).subscribe({
      next: (response: string) => { 
        this.successMessage = response; 
        this.loading = false;
        this.selectedFile = null;
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        console.error('Bulk upload failed', error);

        if (error.error && typeof error.error === 'string') {
          this.errorMessage = `Upload failed: ${error.error}`;
        } else if (error.error && error.error.message) {
          this.errorMessage = `Upload failed: ${error.error.message}`;
        } else {
          this.errorMessage = 'An unknown error occurred during upload. Check console for details.';
        }
      }
    });
  }

  get categoryNames(): string {
    return this.categories.map(cat => cat.name).join(', ');
  }
}
