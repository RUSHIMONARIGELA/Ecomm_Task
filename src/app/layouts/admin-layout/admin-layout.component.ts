import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

declare const lucide: any;

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule,
    RouterOutlet, 
    RouterLink,   
    RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService); 
  private router = inject(Router);

  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false; 
  currentUserRole: string | null = null;
  currentUsername: string | null = null;

  constructor() {
  }

  ngOnInit(): void {
    this.updateAuthStatus();
   
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn('Lucide icons script not loaded. Icons may not render.');
    }
  }

  updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.isAdmin = this.authService.isAdmin();
      this.isSuperAdmin = this.authService.isSuperAdmin(); 
      this.currentUserRole = this.authService.getUserRoleForDisplay();
      this.currentUsername = this.authService.getCurrentUsername();
    } else {
      this.isAdmin = false;
      this.isSuperAdmin = false;
      this.currentUserRole = null;
      this.currentUsername = null;
    }
    console.log('AdminLayoutComponent: Auth Status Updated:', {
      isLoggedIn: this.isLoggedIn,
      isAdmin: this.isAdmin,
      isSuperAdmin: this.isSuperAdmin,
      currentUserRole: this.currentUserRole,
      currentUsername: this.currentUsername
    });
  }

  logout() {
    this.authService.logout();
    this.updateAuthStatus(); 
  }
}
