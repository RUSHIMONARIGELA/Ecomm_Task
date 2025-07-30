import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserDetailsDTO } from '../models/customer-models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/admin/users';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() { }

  private getAuthHeaders(): HttpHeaders {
    const accessToken = this.authService.getToken();
    if (!accessToken) {
      throw new Error('Access token not found. User not authenticated.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
  }

  getAllUsers(): Observable<UserDetailsDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDetailsDTO[]>(this.API_URL, { headers });
  }

  getUserById(userId: number): Observable<UserDetailsDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDetailsDTO>(`${this.API_URL}/${userId}`, { headers });
  }

  // FIX: Modified the request body to match backend's expected Map structure
  updateUserRoles(userId: number, roles: string[]): Observable<UserDetailsDTO> {
    const headers = this.getAuthHeaders();
    // Wrap the roles array in an object with the key "roles"
    const requestBody = { roles: roles }; // This is the change!
    return this.http.put<UserDetailsDTO>(`${this.API_URL}/${userId}/role`, requestBody, { headers });
  }

  updateUser(userId: number, userDetails: Partial<UserDetailsDTO>): Observable<UserDetailsDTO> {
    const headers = this.getAuthHeaders();
    return this.http.put<UserDetailsDTO>(`${this.API_URL}/${userId}`, userDetails, { headers });
  }

  deleteUser(userId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.API_URL}/${userId}`, { headers });
  }
}
