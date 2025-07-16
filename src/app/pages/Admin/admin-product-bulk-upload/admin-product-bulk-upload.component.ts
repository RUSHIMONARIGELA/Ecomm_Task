import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
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
export class AdminProductBulkUploadComponent {
  selectedFile: File | null = null;
  loading= false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  categories : CategoryDTO[] = [];

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  ngOnInIt() : void {

    this.fetchCategories();
  }

  fetchCategories() : void {
    this.categoryService.getAllCategories().subscribe(
      {
        next: (data : CategoryDTO[]) => {
           this.categories = data;
        },
        error:(error : HttpErrorResponse) => {

          console.log('Error fetching categories for bulk  upload: ' , error);
          this.errorMessage='Failed to load categories .check console. ';

        }

      }
    );
  }

  onFileSelected(event : Event): void {
    const input= event.target as HTMLInputElement;
    if(input.files && input.files.length > 0){
      this.selectedFile = input.files[0];
      this.errorMessage = null;
      this.successMessage = null;
    } else {
      this.selectedFile= null;
    }
  }
  onUpload(): void {
    if(!this.selectedFile){
      this.errorMessage = 'Please select a CSV file to upload...';
      return;
    }
    if(this.selectedFile.type !== 'text/csv' && !this.selectedFile.name.endsWith('.csv')){
      this.errorMessage='Invalid file type. Please select a CSV File...';
      this.selectedFile = null;
      return;
    }

    this.loading=true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = new FormData();
    formData.append('file',this.selectedFile, this.selectedFile.name);

    this.productService.uploadProductsCsv(formData).subscribe({
      next:( _response) => {
        this.successMessage= 'Products uploaded successfully';
        alert("product upload successful");
        this.loading=false;
        this.selectedFile=null;

        setTimeout(() => {
          this.router.navigate(['admin/products']);
        }, 200);
      },
      error: (error : HttpErrorResponse) => {
        this.loading=false;
        console.error('Bulk upload failed',error);
        if(error.error && typeof error.error ==='string'){
          this.errorMessage =`upload failed : ${error.error}`;
        }else if (error.error && error.error.message){
          this.errorMessage=`upload failed : ${error.error.message}`;
        }else{
          this.errorMessage=`unexpected error occured while upload....`;
        }
        
      }
    });

  }
  get categoryNames(): string{
    return this.categories.map(cat => cat.name).join(', ');
  }

}
