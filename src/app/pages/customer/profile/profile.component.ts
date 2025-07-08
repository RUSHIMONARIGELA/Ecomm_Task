import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import {ReactiveFormsModule, FormsModule } from '@angular/forms'; 

import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { ProfileDTO } from '../../../models/customer-models';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule], 
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  customerId: number | null = null;
  profile: ProfileDTO = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    addresses: [{ 
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      type: 'SHIPPING' 
    }]
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  private authService=inject(AuthService);
    private customerService=inject(CustomerService);
    private router=inject(Router)
  constructor() { }

  ngOnInit(): void {
    this.customerId = this.authService.getCurrentCustomerId();
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
          // Ensure addresses array is not empty if loaded profile has none
          if (!this.profile.addresses || this.profile.addresses.length === 0) {
            this.profile.addresses = [{
              street: '', city: '', state: '', postalCode: '', country: '', type: 'SHIPPING'
            }];
          }
          this.successMessage = 'Existing profile loaded.';
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.errorMessage = 'No existing profile found. Please create one.';
            // Ensure a blank address is ready for creation if no profile exists
            if (!this.profile.addresses || this.profile.addresses.length === 0) {
                this.profile.addresses = [{
                    street: '', city: '', state: '', postalCode: '', country: '', type: 'SHIPPING'
                }];
            }
          } else {
            this.errorMessage = 'Failed to load profile. Please try again.';
            console.error('Error loading profile:', error);
          }
        }
      });
    }
  }

  onSaveProfile(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.customerId) {
      this.errorMessage = 'Customer ID is missing. Cannot save profile.';
      return;
    }

    // Basic validation for the first address in the array
    if (!this.profile.firstName || !this.profile.lastName || !this.profile.phoneNumber ||
        !this.profile.addresses || this.profile.addresses.length === 0 ||
        !this.profile.addresses[0].street || !this.profile.addresses[0].city ||
        !this.profile.addresses[0].state || !this.profile.addresses[0].postalCode || !this.profile.addresses[0].country) {
      this.errorMessage = 'All profile and primary address fields are required.';
      return;
    }

    this.loading = true;
    this.customerService.createOrUpdateCustomerProfile(this.customerId, this.profile).subscribe({
      next: (response) => {
        this.successMessage = 'Profile and address saved successfully!';
        this.loading = false;
        console.log('Profile saved:', response);
        this.router.navigate(['/home']); // Redirect to home or dashboard
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        console.error('Failed to save profile:', error);
        if (error.error && error.error.message) {
          this.errorMessage = `Failed to save profile: ${error.error.message}`;
        } else {
          this.errorMessage = 'Failed to save profile. Please try again.';
        }
      }
    });
  }

  // Optional: Method to add more addresses if you want to support multiple addresses
  addAddress(): void {
    this.profile.addresses.push({
      street: '', city: '', state: '', postalCode: '', country: '', type: 'BILLING' // Default to BILLING for additional
    });
  }

  // Optional: Method to remove an address
  removeAddress(index: number): void {
    if (this.profile.addresses.length > 1) { // Prevent removing the last address
      this.profile.addresses.splice(index, 1);
    } else {
      this.errorMessage = 'At least one address is required.';
    }
  }
}
