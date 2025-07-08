import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common'; // Add SlicePipe
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

 // Assuming ProductDTO is here
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/CartService'; // Assuming CartService is here
import { AuthService } from '../../../services/auth.service'; // Assuming AuthService is here
import { CartUpdateService } from '../../../services/cart-update.service'; // Assuming CartUpdateService is here
import {  ProductDTO } from '../../../models/product.model';
import {  CategoryDTO } from '../../../models/category-models';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-customerproducts',
  standalone: true,
  imports: [
    CommonModule,
   
    HttpClientModule,
    FormsModule, 
    DecimalPipe,
    SlicePipe
  ],
  templateUrl: './customerproducts.component.html',
  styleUrls: ['./customerproducts.component.css']
})
export class CustomerproductsComponent implements OnInit {

    username: string | null = null;

  products: ProductDTO[] = [];

  loading = true;
  error: string | null = null;
  addingToCartProductId: number | null = null;

  categories: CategoryDTO[] = []; 
  selectedCategoryId: number | null = null; 

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private cartUpdateService = inject(CartUpdateService);
  private categoryService = inject(CategoryService); // NEW: Inject CategoryService
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
        this.username = this.authService.getCurrentUsername();

    this.loadCategories();
    this.loadProducts();   
  }

  loadProducts(categoryId?: number | null): void { // Changed parameter to categoryId
    this.loading = true;
    this.error = null;
    let productsObservable;

    if (categoryId !== null && categoryId !== undefined) {
      productsObservable = this.productService.getProductsByCategoryId(categoryId);
    } else {
      productsObservable = this.productService.getAllProducts();
    }

    productsObservable.subscribe({
      next: (data: ProductDTO[]) => {
        this.products = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
        console.error('CustomerProductsComponent: Error fetching products:', err);
        if (err.error && err.error.message) {
          this.error = `Failed to load products: ${err.error.message}`;
        }
      }
    });
  }

  // NEW: Method to load all available categories dynamically
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: CategoryDTO[]) => {
        this.categories = data;
        // Optionally, add a dummy "All Categories" object if you prefer
        // this.categories = [{ id: null, name: 'All Categories', description: '' }, ...data];
      },
      error: (err: HttpErrorResponse) => {
        console.error('CustomerProductsComponent: Error fetching categories:', err);
        // Decide if this error should prevent product loading or just show a warning
      }
    });
  }

  // NEW: Handler for category dropdown change
  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    // Convert the value to a number. If 'ALL' or empty, it will be NaN, which we convert to null.
    const selectedValue = parseInt(selectElement.value, 10);
    this.selectedCategoryId = isNaN(selectedValue) ? null : selectedValue;
    this.loadProducts(this.selectedCategoryId); // Reload products based on new selection
  }

  addToCart(productId: number | undefined): void {
    if (productId === undefined) {
      console.error('Cannot add to cart: Product ID is undefined.');
      this.error = 'Error adding product to cart: Product ID is missing.';
      return;
    }

    const customerId = this.authService.getCurrentCustomerId();
    if (customerId === null) {
      this.error = 'Customer ID not available. Please log in to add items to cart.';
      console.warn('CustomerProductsComponent: No customer ID found from AuthService. Cannot add to cart.');
      this.router.navigate(['/login']);
      return;
    }

    this.addingToCartProductId = productId;
    this.error = null;

    const quantity = 1;

    this.cartService.addProductToCart(customerId, { productId: productId, quantity: quantity }).subscribe({
      next: (data) => {
        console.log('Product added to cart:', data);
        this.addingToCartProductId = null;
        this.cartUpdateService.notifyCartChanged();
      },
      error: (err: HttpErrorResponse) => {
        this.addingToCartProductId = null;
        console.error('CustomerProductsComponent: Error adding to cart:', err);
        if (err.status === 400) {
          if (err.error && err.error.message && err.error.message.includes('Not enough stock')) {
            this.error = `Failed to add to cart: ${err.error.message}.`;
          } else {
            this.error = 'Failed to add to cart: Invalid request.';
          }
        } else {
          this.error = 'Failed to add to cart. Please try again.';
          if (err.error && err.error.message) {
            this.error += `: ${err.error.message}`;
          }
        }
      }
    });
  }
}
