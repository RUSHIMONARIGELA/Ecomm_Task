import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartDTO, CartItemDTO } from '../../../models/cart-models';
import { CartService } from '../../../services/CartService';
import { AuthService } from '../../../services/auth.service';
import { CartUpdateService } from '../../../services/cart-update.service';
import { OrderService } from '../../../services/order.service';
import { OrderDTO } from '../../../models/order-models';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: CartDTO | null = null;
  loadingCart = true;
  cartError: string | null = null;
  submitting = false;
  processingCheckout = false;

  couponCode: string = '';
  couponError: string | null = null; 
  successMessage: string | null = null; 

  private cartUpdateSubscription: Subscription | undefined;

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cartUpdateService = inject(CartUpdateService);
  private orderService = inject(OrderService);

  constructor() {}

  ngOnInit(): void {
    this.loadCart();
    this.cartUpdateSubscription = this.cartUpdateService.cartChanged$.subscribe(
      () => {
        console.log('Cart updated notification received. Reloading cart...');
        this.loadCart();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.cartUpdateSubscription) {
      this.cartUpdateSubscription.unsubscribe();
    }
  }

  loadCart(): void {
    this.loadingCart = true;
    this.cartError = null;
    this.couponError = null; 
    this.successMessage = null; 
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.cartService.getCartByCustomerId(customerId).subscribe({
        next: (data: CartDTO) => {
          this.cart = data;
          this.loadingCart = false;
          if (this.cart.couponCode) {
            this.couponCode = this.cart.couponCode;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.cartError = 'Failed to load cart. Please try again.';
          this.loadingCart = false;
          console.error('CustomerCartComponent: Error fetching cart:', error);
          if (error.status === 404) {
            this.cartError = 'Cart not found. It might be created on first item addition.';
          } else if (error.error && error.error.message) {
            this.cartError = `Failed to load cart: ${error.error.message}`;
          }
        },
      });
    } else {
      this.cartError = 'Customer ID not available. Please log in.';
      this.loadingCart = false;
      console.warn('CustomerCartComponent: No customer ID found from AuthService. Cannot load cart.');
      this.router.navigate(['/login']);
    }
  }

  onQuantityChange(item: CartItemDTO, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let newQuantity = parseInt(inputElement.value, 10);

    if (isNaN(newQuantity) || newQuantity <= 0) {
      newQuantity = 1;
      inputElement.value = '1';
    }

    const oldQuantity = item.quantity;
    if (item.productDetails?.id !== undefined) {
      this.updateItemQuantity(item.productDetails.id, newQuantity, oldQuantity);
    } else {
      console.error('Product ID is undefined for quantity change.');
      this.cartError = 'Error: Product ID missing for quantity update.';
    }
  }

  updateItemQuantity(
    productId: number | undefined,
    newQuantity: number,
    oldQuantity: number
  ): void {
    if (productId === undefined || !this.cart || !this.cart.customerId) {
      console.error(
        'Cannot update item: Product ID or Customer ID is missing.'
      );
      this.cartError = 'Error updating item: Missing ID.';
      const itemToRevert = this.cart?.cartItems.find(
        (i) => i.productDetails?.id === productId 
      );
      if (itemToRevert) {
        itemToRevert.quantity = oldQuantity;
      }
      return;
    }

    this.submitting = true;
    this.cartError = null;
    this.couponError = null; 
    this.successMessage = null; 

    this.cartService
      .updateProductQuantityInCart(this.cart.customerId, productId, newQuantity)
      .subscribe({
        next: (data: CartDTO) => {
          this.cart = data;
          this.submitting = false;
          console.log('Quantity updated successfully:', data);
          this.cartUpdateService.notifyCartChanged(); 
        },
        error: (error: HttpErrorResponse) => {
          this.cartError = 'Failed to update quantity. Please try again.';
          this.submitting = false;
          console.error(
            'CustomerCartComponent: Error updating quantity:',
            error
          );
          const itemToRevert = this.cart?.cartItems.find(
            (i) => i.productDetails?.id === productId 
          );
          if (itemToRevert) {
            itemToRevert.quantity = oldQuantity;
          }
          if (error.error && error.error.message) {
            this.cartError = `Failed to update quantity: ${error.error.message}`;
          }
        },
      });
  }

  removeItem(productId: number | undefined): void {
    if (productId === undefined || !this.cart || !this.cart.customerId) {
      console.error(
        'Cannot remove item: Product ID or Customer ID is missing.'
      );
      this.cartError = 'Error removing item: Missing ID.';
      return;
    }

    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    this.submitting = true;
    this.cartError = null;
    this.couponError = null; 
    this.successMessage = null; 

    this.cartService
      .removeProductFromCart(this.cart.customerId, productId)
      .subscribe({
        next: (data: CartDTO) => {
          this.cart = data;
          this.submitting = false;
          console.log('Item removed successfully:', data);
          this.cartUpdateService.notifyCartChanged(); 
        },
        error: (error: HttpErrorResponse) => {
          this.cartError = 'Failed to remove item. Please try again.';
          this.submitting = false;
          console.error('CustomerCartComponent: Error removing item:', error);
          if (error.error && error.error.message) {
            this.cartError = `Failed to remove item: ${error.error.message}`;
          }
        },
      });
  }

  clearCart(): void {
    if (!this.cart || !this.cart.customerId) {
      console.error('Cannot clear cart: Customer ID is missing.');
      this.cartError = 'Error clearing cart: Missing Customer ID.';
      return;
    }

    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    this.submitting = true;
    this.cartError = null;
    this.couponError = null; 
    this.successMessage = null; 

    this.cartService.clearCart(this.cart.customerId).subscribe({
      next: () => {
        if (this.cart) {
          this.cart.cartItems = [];
          this.cart.totalAmount = 0; 
          this.cart.couponCode = undefined; 
          this.cart.discountAmount = undefined; 
        }
        this.submitting = false;
        this.couponCode = ''; 
        console.log('Cart cleared successfully.');
        this.cartUpdateService.notifyCartChanged(); 
      },
      error: (error: HttpErrorResponse) => {
        this.cartError = 'Failed to clear cart. Please try again.';
        this.submitting = false;
        console.error('CustomerCartComponent: Error clearing cart:', error);
        if (error.error && error.error.message) {
          this.cartError = `Failed to clear cart: ${error.error.message}`;
        }
      },
    });
  }

  checkout(): void {
    this.cartError = null;
    this.processingCheckout = true;
    this.couponError = null; 
    this.successMessage = null; 

    if (
      !this.cart ||
      !this.cart.cartItems ||
      this.cart.cartItems.length === 0
    ) {
      this.cartError =
        'Your cart is empty. Please add items before checking out.';
      this.processingCheckout = false;
      return;
    }

    const customerId = this.authService.getCurrentCustomerId();
    if (customerId === null) {
      this.cartError = 'Customer ID not available. Please log in to checkout.';
      this.processingCheckout = false;
      this.router.navigate(['/login']);
      return;
    }

    this.orderService.createOrderFromCart(customerId).subscribe({
      next: (order: OrderDTO) => {
        console.log('Order created successfully from cart:', order);
        this.processingCheckout = false;
        this.cartUpdateService.notifyCartChanged(); 

        this.router.navigate(['/home/checkout', order.id]); 
      },
      error: (error: HttpErrorResponse) => {
        this.processingCheckout = false;
        console.error(
          'CustomerCartComponent: Error creating order from cart:',
          error
        );

        if (error.status === 400) {
          if (error.error && error.error.message) {
            if (error.error.message.includes('Not enough stock')) {
              this.cartError = `Checkout failed: ${error.error.message}. Please adjust quantities.`;
            } else if (error.error.message.includes('empty cart')) {
              this.cartError =
                'Checkout failed: Your cart is empty on the server. Please add items.';
            } else {
              this.cartError = `Checkout failed: Invalid cart data. ${error.error.message}`;
            }
          } else {
            this.cartError =
              'Checkout failed: Invalid request. Please check your cart.';
          }
        } else if (error.status === 403) {
          this.cartError =
            'Checkout failed: Access denied. Please ensure you are logged in as the correct customer.';
        } else if (error.status === 500) {
          this.cartError =
            'Checkout failed: An internal server error occurred. Please try again later.';
        } else {
          this.cartError = 'Checkout failed. Please try again.';
          if (error.error && error.error.message) {
            this.cartError += `: ${error.error.message}`;
          }
        }
      },
    });
  }


  getCartSubtotal(): number {
    if (!this.cart || !this.cart.cartItems) {
      return 0;
    }
    return this.cart.cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  }

 
  applyCoupon(): void {
    if (!this.cart || !this.cart.customerId) {
      this.couponError = 'Cart not loaded or customer ID missing.';
      return;
    }
    if (!this.couponCode) {
      this.couponError = 'Please enter a coupon code.';
      return;
    }

    this.couponError = null; 
    this.cartError = null; 
    this.successMessage = null; 
    this.submitting = true; 

    this.cartService.applyCouponToCart(this.cart.customerId, this.couponCode).subscribe({
      next: (data: CartDTO) => {
        this.cart = data;
        this.couponError = null;
        this.successMessage = 'Coupon applied successfully!';
        this.submitting = false;
        this.cartUpdateService.notifyCartChanged(); 
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        console.error('Error applying coupon:', error);
        this.couponError = error.error?.message || 'Failed to apply coupon. Please check the code and try again.';
        this.successMessage = null;
      }
    });
  }

  removeCoupon(): void {
    if (!this.cart || !this.cart.customerId) {
      this.couponError = 'Cart not loaded or customer ID missing.';
      return;
    }

    this.couponError = null; 
    this.cartError = null; 
    this.successMessage = null; 
    this.submitting = true; 

    this.cartService.removeCouponFromCart(this.cart.customerId).subscribe({
      next: (data: CartDTO) => {
        this.cart = data;
        this.couponCode = ''; 
        this.couponError = null;
        this.successMessage = 'Coupon removed successfully!';
        this.submitting = false;
        this.cartUpdateService.notifyCartChanged(); 
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        console.error('Error removing coupon:', error);
        this.couponError = error.error?.message || 'Failed to remove coupon.';
        this.successMessage = null;
      }
    });
  }

}
