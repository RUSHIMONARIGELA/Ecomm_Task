import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CustomerDTO } from '../../../models/customer-models';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css',
})
export class CustomerListComponent {
  customers: CustomerDTO[] = [];
  loadingCustomers = true;
  customersError: string | null = null;
  submitting = false;

  private customerService = inject(CustomerService);
  private router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {}

  loadCustomers(): void {
    this.loadingCustomers = true;
    this.customersError = null;
    this.customerService.getAllCustomers().subscribe({
      next: (data: CustomerDTO[]) => {
        this.customers = data;
        this.loadingCustomers = false;
      },
      error: (err: HttpErrorResponse) => {
        this.customersError = 'Failed to load customers. Please try again.';
        this.loadingCustomers = false;
        console.error('CustomerListComponent: Error fetching customers:', err);
        if (err.error && err.error.message) {
          this.customersError = `Failed to load customers: ${err.error.message}`;
        }
      },
    });
  }

  viewCustomerProfile(customerId: number | undefined): void {
    if (customerId) {
      this.router.navigate(['/admin/customers/edit', customerId]);
    } else {
      console.warn('Attempted to view profile with undefined customer ID.');
      this.customersError = 'Cannot view profile: Customer ID is missing.';
    }
  }

  deleteCustomer(customerId: number | undefined): void {
    if (customerId === undefined) {
      console.error('Cannot delete customer: Customer ID is undefined.');
      this.customersError = 'Error deleting customer: Customer ID is missing.';
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this customer? This action cannot be undone.'
      )
    ) {
      return;
    }

    this.submitting = true;
    this.customersError = null;

    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {
        console.log('Customer deleted successfully:', customerId);
        this.submitting = false;
        this.loadCustomers();
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        console.error('CustomerListComponent: Error deleting customer:', err);

        if (err.status === 409) {
          this.customersError =
            err.error ||
            'Deletion failed: Customer has active orders or other related data.';
        } else if (err.status === 404) {
          this.customersError = 'Deletion failed: Customer not found.';
        } else if (err.error && typeof err.error === 'string') {
          this.customersError = `Deletion failed: ${err.error}`;
        } else if (err.error && err.error.message) {
          this.customersError = `Deletion failed: ${err.error.message}`;
        } else {
          this.customersError =
            'Deletion failed due to an unexpected error. Please try again.';
        }
      },
    });
  }
}
