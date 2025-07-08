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
    router.navigate(['/login']);
    return false;
  }

  if (expectedRole) {
    const userRoles = authService.getUserRoles(); 
    console.log('AuthGuard: User Roles:', userRoles, 'Expected Role:', expectedRole);

    const hasExpectedRole = userRoles.some(role => role.replace('ROLE_', '') === expectedRole);

    if (!hasExpectedRole) {
      console.warn(`AuthGuard: Access denied. User does not have expected role '${expectedRole}'. Redirecting to login.`);
      router.navigate(['/login']);
      return false;
    }
  }

  console.log('AuthGuard: Access granted.');
  return true;
};
