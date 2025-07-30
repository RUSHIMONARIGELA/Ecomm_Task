import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http'; // NEW: Import HttpResponse, HttpErrorResponse

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  twoFactorCode = ''; // NEW: For 2FA input
  error = '';
  twoFactorAuthRequired = false; // NEW: State to control 2FA form visibility
  twoFactorMessage = ''; // NEW: Message for 2FA step

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  onSubmit(): void {
    this.error = ''; // Clear previous errors
    this.twoFactorMessage = ''; // Clear previous messages

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response: HttpResponse<any>) => { // Expecting HttpResponse
        if (response.status === 202) {
          // 2FA is required
          this.twoFactorAuthRequired = true;
          this.twoFactorMessage = response.body?.message || 'A 2FA code has been sent to your email.';
          console.log('LoginComponent: 2FA required. Message:', this.twoFactorMessage);
          // Username is already stored in authService.pending2FaUsername via tap operator
        } else if (response.status === 200) {
          // Normal login successful (2FA not enabled or already handled by backend)
          this.handleSuccessfulLogin();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('LoginComponent: Login error:', err);
        this.error = err.error?.message || 'Invalid username or password.';
        // Clear 2FA state if login fails
        this.twoFactorAuthRequired = false;
        this.authService.clearPending2FaUsername();
      }
    });
  }

  // NEW: Method for 2FA code verification
  onVerify2FACode(): void {
    this.error = ''; // Clear previous errors
    this.twoFactorMessage = ''; // Clear previous messages

    const usernameFor2FA = this.authService.getPending2FaUsername();
    if (!usernameFor2FA) {
      this.error = 'No pending 2FA session. Please log in again.';
      this.twoFactorAuthRequired = false;
      return;
    }

    this.authService.verify2FACode(usernameFor2FA, this.twoFactorCode).subscribe({
      next: (response) => { // This response is AuthResponse, not HttpResponse
        console.log('LoginComponent: 2FA verification successful.');
        this.handleSuccessfulLogin();
      },
      error: (err: HttpErrorResponse) => {
        console.error('LoginComponent: 2FA verification error:', err);
        this.error = err.error?.message || 'Invalid or expired 2FA code.';
        // Do not clear pending2FaUsername here, allow user to retry
      }
    });
  }

  // Helper method to handle successful login and redirection
  private handleSuccessfulLogin(): void {
    const role = this.authService.getUserRoleForDisplay();
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'CUSTOMER') {
      this.router.navigate(['/home']);
    } else {
      this.error = 'Unknown role or no role assigned. Please contact support.';
      this.authService.logout(); // Log out if role is unknown
    }
    this.twoFactorAuthRequired = false; // Reset 2FA state
    this.authService.clearPending2FaUsername(); // Clear pending username
  }

  // NEW: Method to cancel 2FA and go back to initial login form
  cancel2FA(): void {
    this.twoFactorAuthRequired = false;
    this.twoFactorCode = '';
    this.error = '';
    this.twoFactorMessage = '';
    this.authService.clearPending2FaUsername();
  }
}
