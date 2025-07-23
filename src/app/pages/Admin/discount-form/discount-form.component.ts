import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiscountDTO, DiscountService } from '../../../services/discount.service';

@Component({
  selector: 'app-discount-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './discount-form.component.html',
  styleUrl: './discount-form.component.css'
})
export class DiscountFormComponent {
discount: DiscountDTO = {
    code: '',
    type: 'PERCENTAGE', // Default type
    value: 0,
    startDate: this.formatDateForInput(new Date()), // Default to current date/time
    endDate: this.formatDateForInput(new Date(new Date().setFullYear(new Date().getFullYear() + 1))), // Default to 1 year from now
    active: true,
    minOrderAmount: undefined, // Optional
    usageLimit: undefined, // Optional
    usedCount: 0 // Will be set by backend, but initialize for DTO
  };
  isEditMode: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private discountService = inject(DiscountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.discountService.getDiscountById(Number(id)).subscribe({
        next: (data: DiscountDTO) => {
          this.discount = {
            ...data,
            // Format dates for datetime-local input
            startDate: this.formatDateForInput(new Date(data.startDate)),
            endDate: this.formatDateForInput(new Date(data.endDate))
          };
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching discount for edit:', error);
          this.errorMessage = 'Failed to load discount for editing.';
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Convert string dates back to ISO format for backend
    // Ensure minOrderAmount and usageLimit are numbers or null/undefined, not empty strings
    const discountToSend: DiscountDTO = {
      ...this.discount,
      startDate: new Date(this.discount.startDate).toISOString(),
      endDate: new Date(this.discount.endDate).toISOString(),
      minOrderAmount: this.discount.minOrderAmount === null || this.discount.minOrderAmount === undefined ? undefined : Number(this.discount.minOrderAmount),
      usageLimit: this.discount.usageLimit === null || this.discount.usageLimit === undefined ? undefined : Number(this.discount.usageLimit)
    };

    if (this.isEditMode && this.discount.id) {
      this.discountService.updateDiscount(this.discount.id, discountToSend).subscribe({
        next: () => {
          this.successMessage = 'Discount updated successfully!';
          setTimeout(() => this.router.navigate(['/admin/discounts']), 2000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating discount:', error);
          this.errorMessage = error.error?.message || 'Failed to update discount.';
        }
      });
    } else {
      this.discountService.createDiscount(discountToSend).subscribe({
        next: () => {
          this.successMessage = 'Discount created successfully!';
          setTimeout(() => this.router.navigate(['/admin/discounts']), 2000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating discount:', error);
          this.errorMessage = error.error?.message || 'Failed to create discount.';
        }
      });
    }
  }

  // Helper to format Date objects into 'YYYY-MM-DDTHH:mm' string for datetime-local input
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
