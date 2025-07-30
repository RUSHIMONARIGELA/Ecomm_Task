import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http'; // NEW: Import HttpResponse
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  refreshToken: string;
  message?: string;
}

interface TwoFactorRequiredResponse {
  message: string;
  username: string;
}

interface CustomerRegisterPayload {
  userDetails: {
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
  };
  profileDetails?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    addresses?: any[];
  };
}

interface AdminRegisterPayload {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private usernameKey = 'username';
  private userIdKey = 'userId';
  private userEmailKey = 'userEmail';
  private userRolesKey = 'userRoles';

  private pending2FaUsername: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {}

  // FIX: Changed return type to include HttpResponse
  login(credentials: { username: string; password: string }): Observable<HttpResponse<AuthResponse | TwoFactorRequiredResponse>> {
    return this.http.post<AuthResponse | TwoFactorRequiredResponse>(`${this.API_URL}/login`, credentials, { observe: 'response' }).pipe(
      tap(response => {
        if (response.status === 202) {
          const body = response.body as TwoFactorRequiredResponse;
          this.pending2FaUsername = body.username;
          console.log('AuthService: 2FA required for user:', body.username);
          return;
        }

        const authResponse = response.body as AuthResponse;
        this.saveToken(authResponse.token);
        this.saveRefreshToken(authResponse.refreshToken);
        localStorage.setItem(this.usernameKey, credentials.username);

        const decodedToken: any = jwtDecode(authResponse.token);
        if (decodedToken) {
          if (decodedToken.id) {
            localStorage.setItem(this.userIdKey, decodedToken.id.toString());
          }
          if (decodedToken.email) {
            localStorage.setItem(this.userEmailKey, decodedToken.email);
          }
          if (decodedToken.roles) {
            localStorage.setItem(this.userRolesKey, decodedToken.roles);
          }
        } else {
          console.warn('AuthService: No decoded token or claims found after login.');
        }

        console.log('AuthService: Login successful. Stored username:', credentials.username);
        console.log('AuthService: Stored accessToken:', authResponse.token ? 'YES' : 'NO');
        console.log('AuthService: Stored refreshToken:', authResponse.refreshToken ? 'YES' : 'NO');
        console.log('AuthService: Stored userId:', localStorage.getItem(this.userIdKey));
        console.log('AuthService: Stored userEmail:', localStorage.getItem(this.userEmailKey));
        console.log('AuthService: Stored userRoles:', localStorage.getItem(this.userRolesKey));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthService: Login HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }

  verify2FACode(username: string, code: string): Observable<AuthResponse> {
    const payload = { username, twoFactorCode: code };
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-2fa`, payload).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveRefreshToken(response.refreshToken);
        localStorage.setItem(this.usernameKey, username);

        const decodedToken: any = jwtDecode(response.token);
        if (decodedToken) {
          if (decodedToken.id) {
            localStorage.setItem(this.userIdKey, decodedToken.id.toString());
          }
          if (decodedToken.email) {
            localStorage.setItem(this.userEmailKey, decodedToken.email);
          }
          if (decodedToken.roles) {
            localStorage.setItem(this.userRolesKey, decodedToken.roles);
          }
        } else {
          console.warn('AuthService: No decoded token or claims found after 2FA verification.');
        }

        this.pending2FaUsername = null;

        console.log('AuthService: 2FA verification successful. Tokens saved.');
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthService: 2FA Verification HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }

  registerCustomer(payload: CustomerRegisterPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, payload);
  }

  registerAdmin(payload: AdminRegisterPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/register-admin`, payload);
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
    this.pending2FaUsername = null;
    console.log('AuthService: User logged out. Local storage cleared.');
    this.router.navigate(['/login']);
  }

  getUserRoleForDisplay(): string | null {
    const roles = this.getUserRoles();
    if (roles.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('CUSTOMER')) return 'CUSTOMER';
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
            localStorage.setItem(this.userIdKey, decodedToken.id.toString());
          }
          if (decodedToken.email) {
            localStorage.setItem(this.userEmailKey, decodedToken.email);
          }
          if (decodedToken.roles) {
            localStorage.setItem(this.userRolesKey, decodedToken.roles);
          }
        } else {
          console.warn('AuthService: No decoded token or claims found after refresh.');
        }

        console.log('AuthService: Token refreshed. Stored new accessToken:', response.token ? 'YES' : 'NO');
        console.log('AuthService: Stored new refreshToken:', response.refreshToken ? 'YES' : 'NO');
        console.log('AuthService: Stored userId after refresh:', localStorage.getItem(this.userIdKey));
        console.log('AuthService: Stored userEmail after refresh:', localStorage.getItem(this.userEmailKey));
        console.log('AuthService: Stored userRoles after refresh:', localStorage.getItem(this.userRolesKey));
      })
    );
  }

  getCurrentUsername(): string | null {
    const username = localStorage.getItem(this.usernameKey);
    console.log('AuthService: getCurrentUsername called. Retrieved:', username);
    return username;
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem(this.userIdKey);
    return userId ? +userId : null;
  }

  getCurrentUserEmail(): string | null {
    const email = localStorage.getItem(this.userEmailKey);
    console.log('AuthService: getCurrentUserEmail called. Retrieved:', email);
    return email;
  }

  getUserRoles(): string[] {
    const rolesString = localStorage.getItem(this.userRolesKey);
    if (!rolesString) {
      return [];
    }
    try {
      return rolesString.split(',').map((role: string) => role.trim().replace('ROLE_', ''));
    } catch (error) {
      console.error('Error parsing user roles from localStorage:', error);
      return [];
    }
  }

  isAdmin(): boolean {
    const roles = this.getUserRoles();
    return roles.includes('ADMIN');
  }

  isSuperAdmin(): boolean {
    const roles = this.getUserRoles();
    return roles.includes('SUPER_ADMIN');
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

  getPending2FaUsername(): string | null {
    return this.pending2FaUsername;
  }

  clearPending2FaUsername(): void {
    this.pending2FaUsername = null;
  }
}
