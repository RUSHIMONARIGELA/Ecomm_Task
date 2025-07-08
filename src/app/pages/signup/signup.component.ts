import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for NgIf, NgClass
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule } from '@angular/forms'; // ReactiveFormsModule import
import { Router, RouterLink } from '@angular/router'; // RouterLink for the "Log In here" link
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; // HttpClientModule import

import { AuthService } from '../../services/auth.service'; // Adjust path if needed
import { CustomerService } from '../../services/customer.service';
import { CustomerDTO } from '../../models/customer-models';

@Component({
  selector: 'app-signup',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    ReactiveFormsModule, // Import ReactiveFormsModule here
    HttpClientModule,    // Import HttpClientModule here (for AuthService)
    RouterLink,
    FormsModule        // Import RouterLink here
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent  {
   customerRegistration: CustomerDTO = {
    userDetails: {
      userName: '',
      email: '',
      password: ''
    },
    profileDetails: {
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
    }
  };

  confirmPassword = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

    private authService=inject(AuthService);
    private customerService=inject(CustomerService); 
    private router=inject(Router)

  constructor(
    
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']); // Redirect if already logged in
    }
  }

  onSignup(): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Basic validation
    const userDetails = this.customerRegistration.userDetails;
    const profileDetails = this.customerRegistration.profileDetails;
    const primaryAddress = profileDetails?.addresses?.[0]; // Get the first address

    if (!userDetails.userName || !userDetails.email || !userDetails.password || !this.confirmPassword ||
        !profileDetails?.firstName || !profileDetails.lastName || !profileDetails.phoneNumber ||
        !primaryAddress?.street || !primaryAddress.city || !primaryAddress.state ||
        !primaryAddress.postalCode || !primaryAddress.country) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (userDetails.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    // Call the new service method for full registration
    this.customerService.registerFullCustomer(this.customerRegistration).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! You can now log in.';
        console.log('Full signup successful:', response);
        this.loading = false;
        // After successful registration, redirect to login page
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        console.error('Full signup failed:', error);
        if (error.status === 409) { // Conflict, e.g., username or email already exists
          this.errorMessage = 'Username or email already exists. Please choose another.';
        } else if (error.error && error.error.message) {
          this.errorMessage = `Registration failed: ${error.error.message}`;
        } else {
          this.errorMessage = 'Registration failed. Please try again later.';
        }
      }
    });
  }
}
