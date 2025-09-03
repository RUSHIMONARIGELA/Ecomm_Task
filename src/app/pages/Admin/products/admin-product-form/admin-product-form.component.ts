import { Component, inject, OnInit } from '@angular/core'; 
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { CategoryService } from '../../../../services/category.service';
import { CategoryDTO } from '../../../../models/category-models'; 
import { ProductDTO } from '../../../../models/product.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, 
  ],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.css',
})
export class AdminProductFormComponent implements OnInit {

  productForm!: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  submitting = false;
  categories: CategoryDTO[] = []; 

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.fetchCategories();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = +id;
        this.loadProduct(this.productId);
      }
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],

      categoryId: [null, Validators.required],
      stockQuantity: [
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      images: ['', Validators.required],
    });
  }

  fetchCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: CategoryDTO[]) => {
        this.categories = data;
        console.log('Categories loaded:', this.categories);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching categories:', error);
        this.errorMessage = 'Failed to load categories. Please try again.';
      },
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product: ProductDTO) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          stockQuantity: product.stockQuantity,
          images: product.images ? product.images.join(',') : '',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to load product details.';
        console.error('Error loading product:', error);
      },
    });
  }

  onSubmit(): void {
    this.submitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Please correct the highlighted errors in the form.';
      this.submitting = false;
      return;
    }

    const productData: ProductDTO = {
      ...this.productForm.value,
      images: (this.productForm.value.images as string)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      categoryName: '',
    };

    if (this.isEditMode && this.productId !== null) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          this.successMessage = 'Product updated successfully!';
          this.submitting = false;
          this.router.navigate(['/admin/products']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'Failed to update product.';
          this.submitting = false;
          console.error('Error updating product:', error);
          if (
            error.status === 400 &&
            error.error &&
            typeof error.error === 'string'
          ) {
            this.errorMessage = `Failed to update product: ${error.error}`;
          } else if (error.error && error.error.message) {
            this.errorMessage = `Failed to update product: ${error.error.message}`;
          } else {
            this.errorMessage = `Failed to update product: An unexpected error occurred.`;
          }
        },
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.successMessage = 'Product created successfully!';
          this.submitting = false;
          this.router.navigate(['/admin/products']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'Failed to create product.';
          this.submitting = false;
          console.error('Error creating product:', error);
          if (
            error.status === 400 &&
            error.error &&
            typeof error.error === 'string'
          ) {
            this.errorMessage = `Failed to create product: ${error.error}`;
          } else if (error.error && error.error.message) {
            this.errorMessage = `Failed to create product: ${error.error.message}`;
          } else {
            this.errorMessage = `Failed to create product: An unexpected error occurred.`;
          }
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
