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
  private authService = inject(AuthService); // Renamed `auth` to `authService` for consistency
  private router = inject(Router);

  // Properties to easily check roles and user info in the template
  isLoggedIn: boolean = false;
  isAdmin: boolean = false; // This component is for Admin layout, so this will usually be true if logged in here
  isSuperAdmin: boolean = false; // NEW: Property for Super Admin check
  currentUserRole: string | null = null;
  currentUsername: string | null = null;

  constructor() {
    // No direct calls here, use ngOnInit for initialization logic
  }

  ngOnInit(): void {
    this.updateAuthStatus();
    // Potentially subscribe to authService events if you have them,
    // to react to login/logout from other parts of the app dynamically.
  }

  ngAfterViewInit(): void {
    // Ensure Lucide icons are created after the view has been initialized
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn('Lucide icons script not loaded. Icons may not render.');
    }
  }

  // Method to update authentication and role status
  updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.isAdmin = this.authService.isAdmin();
      this.isSuperAdmin = this.authService.isSuperAdmin(); // Update Super Admin status
      this.currentUserRole = this.authService.getUserRoleForDisplay();
      this.currentUsername = this.authService.getCurrentUsername();
    } else {
      // Reset all auth-related properties if not logged in
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
    this.updateAuthStatus(); // Update status after logout
    // The authService.logout() already navigates to /login, but explicit navigation here is harmless.
  }
}
