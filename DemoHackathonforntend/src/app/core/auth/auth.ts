import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  RegisterCustomerRequest,
  LoginRequest,
  UserSummaryDto,
  AuthResponse,
  UpdateCustomerProfileRequest,
  ChangePasswordRequest
} from '../../core/models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth`;
  private readonly accessToken = signal<string | null>(this.getStoredToken());
  private readonly expiresAt = signal(this.getStoredExpiresAt());
  readonly currentUser = signal<UserSummaryDto | null>(this.getStoredUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  register(request: RegisterCustomerRequest): Observable<UserSummaryDto> {
    return this.http.post<UserSummaryDto>(
      `${this.apiUrl}/register`,
      request
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      request
    ).pipe(tap(response => this.setSession(response)));
  }

  getCurrentUser(): Observable<UserSummaryDto> {
    return this.http.get<UserSummaryDto>(
      `${this.apiUrl}/me`
    ).pipe(tap(user => {
      this.currentUser.set(user);
      this.store('retail_user', JSON.stringify(user));
    }));
  }

  updateProfile(request: UpdateCustomerProfileRequest): Observable<UserSummaryDto> {
    return this.http.put<UserSummaryDto>(`${this.apiUrl}/profile`, request).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.store('retail_user', JSON.stringify(user));
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, request);
  }

  getAccessToken(): string | null {
    const token = this.accessToken();
    const expiresAt = this.expiresAt();
    if (token && Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      this.logout();
      return null;
    }
    return token;
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.expiresAt.set(Number.NaN);
    this.removeStored('retail_token');
    this.removeStored('retail_user');
    this.removeStored('retail_expires_at');
  }

  private setSession(response: AuthResponse): void {
    const expiresAt = Date.parse(response.expiresAtUtc);
    this.accessToken.set(response.accessToken);
    this.currentUser.set(response.user);
    this.expiresAt.set(expiresAt);
    this.store('retail_token', response.accessToken);
    this.store('retail_user', JSON.stringify(response.user));
    this.store('retail_expires_at', expiresAt.toString());
  }

  private getStoredToken(): string | null {
    const expiresAt = this.getStoredExpiresAt();
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      this.removeStored('retail_token');
      this.removeStored('retail_user');
      this.removeStored('retail_expires_at');
      return null;
    }
    return this.readStored('retail_token');
  }

  private getStoredExpiresAt(): number {
    const value = this.readStored('retail_expires_at');
    return value ? Number(value) : Number.NaN;
  }

  private getStoredUser(): UserSummaryDto | null {
    const value = this.readStored('retail_user');
    if (!value) return null;
    try {
      return JSON.parse(value) as UserSummaryDto;
    } catch {
      return null;
    }
  }

  private readStored(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private store(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  }

  private removeStored(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  }
}