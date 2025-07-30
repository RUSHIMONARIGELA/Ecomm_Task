import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerDTO } from '../../../models/customer-models';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css',
})
export class CustomerDetailComponent {
  customerId: number | null = null;
  customer: CustomerDTO | null = null;
  loading = true;
  error: string | null = null;
  submitting = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  constructor() {}

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.customerId)) {
      this.error = 'Invalid Customer ID provided.';
      this.loading = false;
      return;
    }
    this.loadCustomerDetails();
  }

  loadCustomerDetails(): void {
    if (this.customerId === null) return;

    this.loading = true;
    this.error = null;
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (data: CustomerDTO) => {
        this.customer = data;
        if (!this.customer.userDetails) {
          this.customer.userDetails = { username: '', email: '' };
        }
        if (!this.customer.profileDetails) {
          this.customer.profileDetails = {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            addresses: [],
          };
        }
        if (
          !this.customer.profileDetails.addresses ||
          this.customer.profileDetails.addresses.length === 0
        ) {
          this.customer.profileDetails.addresses = [
            {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
              type: 'SHIPPING',
            },
          ];
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load customer details.';
        this.loading = false;
        console.error(
          'AdminCustomerDetailComponent: Error loading customer:',
          err
        );
        if (err.status === 404) {
          this.error = 'Customer not found.';
        } else if (err.error && err.error.message) {
          this.error = `Failed to load customer: ${err.error.message}`;
        }
      },
    });
  }

  onUpdateCustomer(): void {
    if (this.customer === null || this.customerId === null) {
      this.error = 'No customer data to update.';
      return;
    }

    this.submitting = true;
    this.error = null;

    this.customerService
      .updateCustomer(this.customerId, this.customer)
      .subscribe({
        next: (updatedCustomer: CustomerDTO) => {
          this.customer = updatedCustomer;
          this.submitting = false;
          console.log('Customer updated successfully:', updatedCustomer);
          this.router.navigate(['/admin/customers']);
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to update customer.';
          this.submitting = false;
          console.error(
            'AdminCustomerDetailComponent: Error updating customer:',
            err
          );
          if (err.error && err.error.message) {
            this.error = `Failed to update customer: ${err.error.message}`;
          }
        },
      });
  }

  addAddress(): void {
    if (this.customer?.profileDetails?.addresses) {
      this.customer.profileDetails.addresses.push({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        type: 'SHIPPING',
      });
    }
  }

  removeAddress(index: number): void {
    if (
      this.customer?.profileDetails?.addresses &&
      this.customer.profileDetails.addresses.length > 1
    ) {
      this.customer.profileDetails.addresses.splice(index, 1);
    } else if (this.customer?.profileDetails?.addresses?.length === 1) {
      this.error = 'A customer must have at least one address.';
    }
  }
}
