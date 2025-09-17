import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Review } from '../../../models/review.model';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-review',
  imports: [CommonModule,FormsModule],
  templateUrl: './product-review.component.html',
  styleUrl: './product-review.component.css'
})
export class ProductReviewComponent {

  @Input() productId!: number;

  reviews: Review[] = [];
  newReview: Review = {
    productId: 0,
    rating: 0,
    reviewText: '',
    username: 'Guest'
  };

  private productService= inject(ProductService);
  private authservice= inject(AuthService);

  constructor() { }

  ngOnInit(): void {
    if (this.productId) {
      this.loadReviews();
    }
    this.newReview.username = this.authservice.getCurrentUsername() ?? 'Guest';
  }

  loadReviews(): void {
    this.productService.getReviewsForProduct(this.productId).subscribe(
      (data) => {
        this.reviews = data;
      },
      (error) => {
        console.error('Error loading reviews:', error);
      }
    );
  }

  submitReview(): void {
    if (this.newReview.rating > 0 && this.newReview.reviewText.trim() !== '') {
      this.newReview.productId = this.productId;
      this.productService.submitReview(this.newReview).subscribe(
        (response) => {
          console.log('Review submitted successfully', response);
          this.reviews.push(response);
          // Add the new review to the list
          this.resetForm();
        },
        (error) => {
          console.error('Error submitting review:', error);
        }
      );
    }
  }

  resetForm(): void {
    this.newReview = {
      productId: this.productId,
      rating: 0,
      reviewText: '',
      username: this.authservice.getCurrentUsername() ?? 'Guest'
    };
  }

  setRating(rating: number): void {
    this.newReview.rating = Number(rating);
    console.log('Selected Rating:', this.newReview.rating);
  }
}