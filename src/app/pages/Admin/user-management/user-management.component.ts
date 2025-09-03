import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, AfterViewInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { UserDetailsDTO } from '../../../models/customer-models'; 
import { UserService } from '../../../services/user.service'; 
import { AuthService } from '../../../services/auth.service'; 

declare const lucide: any; 

@Component({
  selector: 'app-user-management',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent { 
users: UserDetailsDTO[] = [];
  loading: boolean = true;
  error: string | null = null;

  selectedUser: UserDetailsDTO | null = null;

  availableRoles: string[] = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];
  selectedRoles: string[] = []; 

  showRoleModal: boolean = false;
  currentUserId: number | null = null;

  private userService = inject(UserService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('UserManagementComponent: Authenticated User ID (currentUserId):', this.currentUserId);
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn('Lucide icons script not loaded. Icons may not render.');
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        console.log('UserManagementComponent: Users loaded:', this.users);
      },
      error: (err) => {
        console.error('UserManagementComponent: Error loading users:', err);
        this.error = 'Failed to load users. ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  openRoleModal(user: UserDetailsDTO): void {
    console.log('UserManagementComponent: openRoleModal called for user:', user.username, ' (ID:', user.id, ')');
    console.log('UserManagementComponent: Current Authenticated User ID:', this.currentUserId);

    if (user.id === this.currentUserId) {
      alert('You cannot change your own roles.');
      console.warn('UserManagementComponent: Attempted to edit own roles. Blocking.');
      return;
    }
    this.selectedUser = { ...user };

    this.selectedRoles = this.selectedUser.roles || [];
    this.showRoleModal = true;
    console.log('UserManagementComponent: Modal opened for user:', this.selectedUser.username);
    console.log('UserManagementComponent: Initial selectedRoles in modal:', this.selectedRoles); 
  }

  closeRoleModal(): void {
    this.selectedUser = null;
    this.selectedRoles = [];
    this.showRoleModal = false;
    this.error = null;
    console.log('UserManagementComponent: Modal closed.');
  }

  onRoleChange(roleWithoutPrefix: string, event: Event): void { 
    const isChecked = (event.target as HTMLInputElement).checked;
    const fullRoleName = `ROLE_${roleWithoutPrefix}`; 

    if (isChecked) {
      if (!this.selectedRoles.includes(fullRoleName)) {
        this.selectedRoles.push(fullRoleName);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== fullRoleName);
    }
    console.log('UserManagementComponent: Selected roles updated:', this.selectedRoles);
  }

  updateUserRoles(): void {
    if (!this.selectedUser || !this.selectedUser.id) {
      this.error = 'No user selected for role update.';
      console.error('UserManagementComponent: No user selected for role update.');
      return;
    }

    this.error = null;
    const rolesToSend = this.selectedRoles; 

    console.log('UserManagementComponent: Attempting to update roles for user ID:', this.selectedUser.id, 'with roles:', rolesToSend);

    this.userService.updateUserRoles(this.selectedUser.id, rolesToSend).subscribe({
      next: (updatedUser) => {
        alert('User roles updated successfully!');
        this.closeRoleModal();
        this.loadUsers();
        console.log('UserManagementComponent: Roles updated successfully for user:', updatedUser.username);
      },
      error: (err) => {
        console.error('UserManagementComponent: Error updating user roles:', err);
        this.error = 'Failed to update roles: ' + (err.error?.message || err.message);
      }
    });
  }
}
