import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data?.['expectedRole']; 
  const token = authService.getToken();

  if (!token || authService.isTokenExpired(token)) {
    console.warn('AuthGuard: No token or token expired. Redirecting to login.');
    authService.logout(); 
    return false;
  }

  if (expectedRole) {
    const userRoles = authService.getUserRoles(); 
    console.log(
      'AuthGuard: User Roles:',
      userRoles,
      'Expected Role:',
      expectedRole
    );

    
    let hasPermission = false;
    if (userRoles.includes('SUPER_ADMIN')) {
      hasPermission = true;
    } else if (userRoles.includes('ADMIN')) {
    
      if (expectedRole === 'ADMIN' || expectedRole === 'CUSTOMER') {
        hasPermission = true;
      }
    } else if (userRoles.includes('CUSTOMER')) {
     
      if (expectedRole === 'CUSTOMER') {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      console.warn(
        `AuthGuard: Access denied. User does not have sufficient role for '${expectedRole}'. Redirecting to login.`
      );
      router.navigate(['/login']); 
      return false;
    }
  }

  console.log('AuthGuard: Access granted.');
  return true;
};
