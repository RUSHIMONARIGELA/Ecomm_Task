import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DiscountDTO, DiscountService } from '../../../services/discount.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-discount-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './discount-list.component.html',
  styleUrl: './discount-list.component.css'
})
export class DiscountListComponent {


discounts: DiscountDTO[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private discountService = inject(DiscountService);

  ngOnInit(): void {
    this.loadDiscounts();
  }

  loadDiscounts(): void {
    this.discountService.getAllDiscounts().subscribe({
      next: (data: DiscountDTO[]) => {
        this.discounts = data;
        this.errorMessage = null;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching discounts:', error);
        this.errorMessage = 'Failed to load discounts. Please try again.';
      }
    });
  }

  deleteDiscount(id: number): void {
    if (confirm('Are you sure you want to delete this discount code?')) {
      this.discountService.deleteDiscount(id).subscribe({
        next: () => {
          this.successMessage = 'Discount deleted successfully!';
          this.errorMessage = null;
          this.loadDiscounts(); // Reload list after deletion
          setTimeout(() => this.successMessage = null, 3000); // Clear message after 3 seconds
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting discount:', error);
          this.errorMessage = error.error?.message || 'Failed to delete discount.';
          this.successMessage = null;
        }
      });
    }
  }
}

