import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Required for [(ngModel)]


import { CategoryDTO } from '../../../models/category-models';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/CartService';
import { AuthService } from '../../../services/auth.service';
import { CartUpdateService } from '../../../services/cart-update.service';
import { CategoryService } from '../../../services/category.service';
import { ProductDTO } from '../../../models/product.model';

@Component({
  selector: 'app-customerproducts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule, 
    
  ],
  templateUrl: './customerproducts.component.html',
  styleUrls: ['./customerproducts.component.css']
})
export class CustomerproductsComponent implements OnInit {

  @ViewChild('productCarousel') productCarousel!: ElementRef;

  username : string | null = null;
  products: ProductDTO[] = [];
  originalProducts: ProductDTO[] = [];
  loading = true;
  error: string | null = null;
  addingToCartProductId: number | null = null;

  categories: CategoryDTO[] = [];
  selectedCategoryId: number | null = null;

  currentSortOption: string = 'default'; 

  public authService = inject(AuthService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private cartUpdateService = inject(CartUpdateService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.username=this.authService.getCurrentUsername();
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts(categoryId?: number | null): void {
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
        this.originalProducts = [...data]; 
        this.products = [...data]; 
        this.sortProducts(); 
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

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: CategoryDTO[]) => {
        this.categories = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('CustomerProductsComponent: Error fetching categories:', err);
      }
    });
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = parseInt(selectElement.value, 10);
    this.selectedCategoryId = isNaN(selectedValue) ? null : selectedValue;
    this.loadProducts(this.selectedCategoryId); 
    this.currentSortOption = 'default'; 
  }

  sortProducts(): void {
    const productsToSort = [...this.products]; 
    switch (this.currentSortOption) {
      case 'nameAsc':
        productsToSort.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        productsToSort.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'priceAsc':
        productsToSort.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        productsToSort.sort((a, b) => b.price - a.price);
        break;
      case 'default':
      default:
        // No sort needed, leave the order as is
        break;
    }
    this.products = productsToSort; 
  }

  addToCart(productId: number | undefined): void {
    if (productId === undefined) {
      console.error('Cannot add to cart: Product ID is undefined.');
      this.error = 'Error adding product to cart: Product ID is missing.';
      return;
    }

    const customerId = this.authService.getCurrentUserId();
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
        alert('Product added to cart Successfully...')
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

  /**
   * Scrolls the product carousel to the right.
   */
  scrollRight(): void {
    const element = this.productCarousel.nativeElement;
    element.scrollBy({ left: element.offsetWidth, behavior: 'smooth' });
  }

  /**
   * Scrolls the product carousel to the left.
   */
  scrollLeft(): void {
    const element = this.productCarousel.nativeElement;
    element.scrollBy({ left: -element.offsetWidth, behavior: 'smooth' });
  }
}
