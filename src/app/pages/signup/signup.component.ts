import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { CustomerDTO } from '../../models/customer-models';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  customerRegistration: CustomerDTO = {
    userDetails: {
      userName: '',
      email: '',
      password: '',
    },
    profileDetails: {
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
    },
  };

  confirmPassword = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  onSignup(): void {
    this.errorMessage = null;
    this.successMessage = null;

    const userDetails = this.customerRegistration.userDetails;
    const profileDetails = this.customerRegistration.profileDetails;
    const primaryAddress = profileDetails?.addresses?.[0];

    if (
      !userDetails.userName ||
      !userDetails.email ||
      !userDetails.password ||
      !this.confirmPassword ||
      !profileDetails?.firstName ||
      !profileDetails.lastName ||
      !profileDetails.phoneNumber ||
      !primaryAddress?.street ||
      !primaryAddress.city ||
      !primaryAddress.state ||
      !primaryAddress.postalCode ||
      !primaryAddress.country
    ) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (userDetails.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.customerService
      .registerFullCustomer(this.customerRegistration)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Registration successful! You can now log in.';
          console.log('Full signup successful:', response);
          this.loading = false;
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Full signup failed:', error);
          if (error.status === 409) {
            this.errorMessage =
              'Username or email already exists. Please choose another.';
          } else if (error.error && error.error.message) {
            this.errorMessage = `Registration failed: ${error.error.message}`;
          } else {
            this.errorMessage = 'Registration failed. Please try again later.';
          }
        },
      });
  }
}
