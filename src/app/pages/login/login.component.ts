import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  twoFactorCode = '';
  error = '';
  twoFactorAuthRequired = false;
  twoFactorMessage = '';
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  onSubmit(): void {
    this.error = '';
    this.twoFactorMessage = '';

    this.authService
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 202) {
            this.twoFactorAuthRequired = true;
            this.twoFactorMessage =
              response.body?.message ||
              'A 2FA code has been sent to your email.';
            console.log(
              'LoginComponent: 2FA required. Message:',
              this.twoFactorMessage
            );
          } else if (response.status === 200) {
            this.handleSuccessfulLogin();
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('LoginComponent: Login error:', err);
          this.error = err.error?.message || 'Invalid username or password.';
          this.twoFactorAuthRequired = false;
          this.authService.clearPending2FaUsername();
        },
      });
  }

  onVerify2FACode(): void {
    this.error = '';
    this.twoFactorMessage = '';

    const usernameFor2FA = this.authService.getPending2FaUsername();
    if (!usernameFor2FA) {
      this.error = 'No pending 2FA session. Please log in again.';
      this.twoFactorAuthRequired = false;
      return;
    }

    this.authService
      .verify2FACode(usernameFor2FA, this.twoFactorCode)
      .subscribe({
        next: (response) => {
          console.log('LoginComponent: 2FA verification successful.');
          this.handleSuccessfulLogin();
        },
        error: (err: HttpErrorResponse) => {
          console.error('LoginComponent: 2FA verification error:', err);
          this.error = err.error?.message || 'Invalid or expired 2FA code.';
        },
      });
  }

  private handleSuccessfulLogin(): void {
    const role = this.authService.getUserRoleForDisplay();
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'CUSTOMER') {
      Swal.fire({
        title: 'Authentication!',
        text: 'You have successfully logged in!',
        icon: 'success',
      });
      this.router.navigate(['/home']);
    } else {
      this.error = 'Unknown role or no role assigned. Please contact support.';
      this.authService.logout();
    }
    this.twoFactorAuthRequired = false;
    this.authService.clearPending2FaUsername();
  }

  cancel2FA(): void {
    this.twoFactorAuthRequired = false;
    this.twoFactorCode = '';
    this.error = '';
    this.twoFactorMessage = '';
    this.authService.clearPending2FaUsername();
  }
}
