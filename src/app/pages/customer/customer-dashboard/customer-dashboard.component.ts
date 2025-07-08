import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DecimalPipe, SlicePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/CartService';

import { CartUpdateService } from '../../../services/cart-update.service';
import { CartDTO } from '../../../models/cart-models';
import { ProductDTO } from '../../../models/product.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgIf, NgFor, DecimalPipe, SlicePipe
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent  {
  username: string | null = null;
  featuredProducts: ProductDTO[] = [];
  loadingProducts = true;
  productsError: string | null = null;

  cartSuccessMessage: string | null = null;
  cartErrorMessage: string | null = null;
  addingToCart: { [productId: number]: boolean } = {};


  private authService= inject(AuthService);
    private productService=inject(ProductService);
    private cartService=inject(CartService);
    private cartUpdateService=inject(CartUpdateService);
    private router=inject(Router);

  constructor(
    
  ) {}

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
      error: (error) => {
        this.productsError = 'Failed to load products. Please try again later.';
        this.loadingProducts = false;
        console.error('Error fetching featured products for customer dashboard:', error);
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

  addToCart(productId: number | undefined): void {
    this.cartSuccessMessage = null;
    this.cartErrorMessage = null;

    if (productId === undefined) {
      this.cartErrorMessage = 'Cannot add to cart: Product ID is missing.';
      console.warn('CustomerDashboardComponent: Product ID is undefined for add to cart.');
      return;
    }

    const customerId = this.authService.getCurrentCustomerId();
    if (customerId === null) {
      this.cartErrorMessage = 'You must be logged in to add items to the cart.';
      console.warn('CustomerDashboardComponent: Customer ID not found. User not logged in.');
      this.router.navigate(['/login']);
      return;
    }

    this.addingToCart[productId] = true;

    const quantityToAdd = 1;
    const addItemToCartDTO = { productId: productId, quantity: quantityToAdd };

    this.cartService.addProductToCart(customerId, addItemToCartDTO).subscribe({
      next: (cartResponse: CartDTO) => { // Explicitly type cartResponse as CartDTO
        this.cartSuccessMessage = `"${this.featuredProducts.find(p => p.id === productId)?.name || 'Product'}" added to cart!`;
        console.log('Product added to cart:', cartResponse);
        this.addingToCart[productId] = false;
        this.cartUpdateService.notifyCartChanged();
      },
      error: (error: HttpErrorResponse) => {
        this.cartErrorMessage = 'Failed to add product to cart. Please try again.';
        this.addingToCart[productId] = false;
        console.error('CustomerDashboardComponent: Error adding to cart:', error);
        if (error.error && error.error.message) {
          this.cartErrorMessage = `Failed to add to cart: ${error.error.message}`;
        } else if (error.status === 400) {
          this.cartErrorMessage = 'Invalid quantity or product not found.';
        } else if (error.status === 409) {
          this.cartErrorMessage = 'Not enough stock available for this product.';
        }
      }
    });
  }
}
