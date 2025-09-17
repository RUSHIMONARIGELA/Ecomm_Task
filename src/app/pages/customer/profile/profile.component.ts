import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { ProfileDTO } from '../../../models/customer-models';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  customerId: number | null = null;
  profile: ProfileDTO = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    addresses: [
      {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        type: 'SHIPPING',
      },
    ],
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  constructor() {}

  ngOnInit(): void {
    this.customerId = this.authService.getCurrentUserId();
    if (!this.customerId) {
      this.errorMessage = 'Customer not identified. Please log in.';
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile(): void {
    if (this.customerId) {
      this.customerService.getCustomerProfile(this.customerId).subscribe({
        next: (data: ProfileDTO) => {
          this.profile = data;
          if (!this.profile.addresses || this.profile.addresses.length === 0) {
            this.profile.addresses = [
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
          Swal.fire("Existing profile loaded..");
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            Swal.fire({
  icon: "error",
  title: "Oops...",
  text: "No existing profile found. Please create one.",
});
            if (
              !this.profile.addresses ||
              this.profile.addresses.length === 0
            ) {
              this.profile.addresses = [
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
          } else {
            Swal.fire({
  icon: "error",
  title: "Oops...",
  text: "Failed to load profile. Pleasetry again.",
});
            console.error('Error loading profile:', error);
          }
        },
      });
    }
  }

  onSaveProfile(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.customerId) {
      Swal.fire({
  icon: "error",
  title: "Oops...",
  text: "Customer ID is mising. Cannot save profile.",
});
      return;
    }

    if (
      !this.profile.firstName ||
      !this.profile.lastName ||
      !this.profile.phoneNumber ||
      !this.profile.addresses ||
      this.profile.addresses.length === 0 ||
      !this.profile.addresses[0].street ||
      !this.profile.addresses[0].city ||
      !this.profile.addresses[0].state ||
      !this.profile.addresses[0].postalCode ||
      !this.profile.addresses[0].country
    ) {
      this.errorMessage =
        'All profile and primary address fields are required.';
      return;
    }

    this.loading = true;
    this.customerService
      .createOrUpdateCustomerProfile(this.customerId, this.profile)
      .subscribe({
        next: (response) => {
          Swal.fire({
  title: "Good job!",
  text: "Profile and address saved successfully!",
  icon: "success"
});
          this.loading = false;
          console.log('Profile saved:', response);
          this.router.navigate(['/home']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Failed to save profile:', error);
          if (error.error && error.error.message) {

            this.errorMessage = `Failed to save profile: ${error.error.message}`;
          } else {
            Swal.fire({
  icon: "error",
  title: "Oops...",
  text: "Failed to save profile.please try again.",
});
            
          }
        },
      });
  }

  addAddress(): void {
    this.profile.addresses.push({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      type: 'BILLING',
    });
  }

  removeAddress(index: number): void {
    if (this.profile.addresses.length > 1) {
      this.profile.addresses.splice(index, 1);
    } else {
      Swal.fire({
  icon: "error",
  title: "Oops...",
  text: "At least one address is required!",
});
    }
  }
}
