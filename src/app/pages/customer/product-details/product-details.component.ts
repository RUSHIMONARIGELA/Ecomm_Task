import { Component, inject, OnInit } from '@angular/core';
import { ProductDTO } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/CartService';
import { AuthService } from '../../../services/auth.service';
import { AddItemToCartRequestDTO } from '../../../models/add-item-to-cart-models';
import { CartDTO } from '../../../models/cart-models';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { ProductReviewComponent } from '../product-review/product-review.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-details',
  standalone: true, 
  imports: [CommonModule, FormsModule,ProductReviewComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'] 
})
export class ProductDetailsComponent implements OnInit { 
  product: ProductDTO | null = null;
  isLoading: boolean = false;
  quantity: number = 1;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  
  currentImageIndex: number = 0;

  private route= inject(ActivatedRoute);
    private productService=inject(ProductService);
    private cartService=inject(CartService);
    private authService=inject(AuthService);
    private router=inject(Router)
  constructor(
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = Number(params.get('id'));
      if (productId) {
        this.isLoading = true;
        this.message = null;
        this.messageType = null;
        this.productService.getProductById(productId).subscribe({
          next: (product) => {
            this.product = product;
            if (this.product.images && this.product.images.length > 0) {
                this.currentImageIndex = 0;
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to fetch product details', err);
            this.isLoading = false;
            this.message = 'Product not found.';
            this.messageType = 'error';
            setTimeout(() => {
                this.router.navigate(['/home']);
            }, 3000);
          }
        });
      }
    });
  }

  selectImage(index: number): void {
    if (this.product && this.product.images && index >= 0 && index < this.product.images.length) {
      this.currentImageIndex = index;
    }
  }

  prevImage(): void {
    if (this.product && this.product.images && this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.product && this.product.images && this.currentImageIndex < this.product.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.message = null;
      this.messageType = null;

      const customerId = this.authService.getCurrentUserId();
      if (!customerId) {
        Swal.fire({
  icon: "error",
  title: "Oops...",
  text: "You must be logged in to add products to the cart.",
  footer: '<a href="/login">Login</a>'
});
        // this.message = 'You must be logged in to add products to the cart.';
        // this.messageType = 'error';
        return;
      }

      if (!this.product.id) {
        this.message = 'Product ID is missing. Cannot add to cart.';
        this.messageType = 'error';
        return;
      }
      
      const addItemToCartDTO: AddItemToCartRequestDTO = {
        productId: this.product.id,
        quantity: this.quantity
      };

      this.cartService.addProductToCart(customerId, addItemToCartDTO).subscribe({
        next: (cartDto: CartDTO) => {

          Swal.fire({
  title: "Good job!",
  text: "You have succesfully added the product into the cart!",
  icon: "success"
});
          // this.message = 'Product added to cart!';
          // this.messageType = 'success';
          // console.log('Product added to cart. Current cart:', cartDto);
        },
        error: (err) => {
          console.error('Failed to add item to cart', err);

          Swal.fire({
  title: 'Error!',
  text: 'Do you want to continue',
  icon: 'error',
  confirmButtonText: 'Yes'
})

          // this.message = 'Failed to add product to cart.';
          // this.messageType = 'error';
        }
      });
    }
  }

  onQuantityChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = parseInt(inputElement.value, 10);
    if (!isNaN(value) && value > 0) {
      this.quantity = value;
    } else {
      this.quantity = 1;
      inputElement.value = '1';
    }
  }
}
