import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  // ✅ Fixed
})
export class LoginComponent {
  userName = '';
  password = '';
  error = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.authService.login({ userName: this.userName, password: this.password }).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        const role = this.authService.getUserRole();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'CUSTOMER') {
          this.router.navigate(['/home']);
        } else {
          this.error = 'Unknown role';
        }
      },
      error: () => {
        this.error = 'Invalid credentials';
      }
    });
  }
}
