import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  refreshToken: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private usernameKey = 'username';
  private customerIdKey = 'customerId';
  private userEmailKey = 'userEmail';

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {}

  login(credentials: { userName: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveRefreshToken(response.refreshToken);
        localStorage.setItem(this.usernameKey, credentials.userName);
        const decodedToken: any = jwtDecode(response.token);
        if (decodedToken) {
          
          if (decodedToken.id) {
            localStorage.setItem(this.customerIdKey, decodedToken.id.toString());
          }
          if (decodedToken.email) {
            localStorage.setItem(this.userEmailKey, decodedToken.email);
          }
         
          if (decodedToken.roles) {
            localStorage.setItem('userRoles', decodedToken.roles); 
          }
        } else {
          console.warn('AuthService: No decoded token or claims found after login.');
        }

        console.log('AuthService: Login successful. Stored username:', credentials.userName);
        console.log('AuthService: Stored accessToken:', response.token ? 'YES' : 'NO');
        console.log('AuthService: Stored refreshToken:', response.refreshToken ? 'YES' : 'NO');
        console.log('AuthService: Stored customerId:', localStorage.getItem(this.customerIdKey));
        console.log('AuthService: Stored userEmail:', localStorage.getItem(this.userEmailKey));
        console.log('AuthService: Stored userRoles:', localStorage.getItem('userRoles'));
      })
    );
  }


  register(userName: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, { userName, email, password, role });
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveRefreshToken(refreshToken: string) {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  logout() {
    localStorage.clear(); 
    console.log('AuthService: User logged out. Local storage cleared.');
    this.router.navigate(['/login']);
  }

  
  getUserRole(): string | null {
    const roles = this.getUserRoles();
    if (roles.length > 0) {
    
      return roles[0].replace('ROLE_', '');
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const loggedIn = !!token && !this.isTokenExpired(token);
    console.log('AuthService: isLoggedIn called. Status:', loggedIn);
    return loggedIn;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token missing'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveRefreshToken(response.refreshToken);

        const decodedToken: any = jwtDecode(response.token);
        if (decodedToken) {
          if (decodedToken.id) {
            localStorage.setItem(this.customerIdKey, decodedToken.id.toString());
          }
          if (decodedToken.email) {
            localStorage.setItem(this.userEmailKey, decodedToken.email);
          }
          if (decodedToken.roles) {
            localStorage.setItem('userRoles', decodedToken.roles); 
          }
        } else {
          console.warn('AuthService: No decoded token or claims found after refresh.');
        }

        console.log('AuthService: Token refreshed. Stored new accessToken:', response.token ? 'YES' : 'NO');
        console.log('AuthService: Stored new refreshToken:', response.refreshToken ? 'YES' : 'NO');
        console.log('AuthService: Stored customerId after refresh:', localStorage.getItem(this.customerIdKey));
        console.log('AuthService: Stored userEmail after refresh:', localStorage.getItem(this.userEmailKey));
        console.log('AuthService: Stored userRoles after refresh:', localStorage.getItem('userRoles'));
      })
    );
  }

  getCurrentUsername(): string | null {
    const username = localStorage.getItem(this.usernameKey);
    console.log('AuthService: getCurrentUsername called. Retrieved:', username);
    return username;
  }

  getCurrentCustomerId(): number | null {
    const customerId = localStorage.getItem(this.customerIdKey);
    return customerId ? +customerId : null;
  }

  getCurrentUserEmail(): string | null {
    const email = localStorage.getItem(this.userEmailKey);
    console.log('AuthService: getCurrentUserEmail called. Retrieved:', email);
    return email;
  }

  
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken && decodedToken.roles) {
        
        return decodedToken.roles.split(',').map((role: string) => role.trim().replace('ROLE_', ''));
      }
      return [];
    } catch (error) {
      console.error('Error decoding JWT or extracting roles:', error);
      return [];
    }
  }

  isAdmin(): boolean {
    const roles = this.getUserRoles();
    return roles.includes('ADMIN'); 
  }

   isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp === undefined) {
        return false;
      }
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      const isExpired = !(date.valueOf() > new Date().valueOf());
      console.log('AuthService: Token expiration check. Expired:', isExpired);
      if (isExpired) {
        console.warn('AuthService: Token is expired.');
      }
      return isExpired;
    } catch (error) {
      console.error('AuthService: Error checking token expiration (malformed token?):', error);
      return true; 
    }
  }
}
