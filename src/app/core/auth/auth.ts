import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  RegisterCustomerRequest,
  LoginRequest,
  UserSummaryDto,
  AuthResponse
} from '../../core/models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly accessTokenKey = 'retail-ordering.access-token';
  private readonly tokenExpiryKey = 'retail-ordering.token-expiry';
  private readonly currentUserState = signal<UserSummaryDto | null>(null);

  readonly currentUser = this.currentUserState.asReadonly();

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
    ).pipe(tap(response => this.storeSession(response)));
  }

  getCurrentUser(): Observable<UserSummaryDto> {
    return this.http.get<UserSummaryDto>(
      `${this.apiUrl}/me`
    ).pipe(tap(user => this.currentUserState.set(user)));
  }

  getAccessToken(): string | null {
    const token = sessionStorage.getItem(this.accessTokenKey);
    const expiry = sessionStorage.getItem(this.tokenExpiryKey);
    const expiryTimestamp = expiry ? Date.parse(expiry) : Number.NaN;

    if (!token || !Number.isFinite(expiryTimestamp) || expiryTimestamp <= Date.now()) {
      this.logout();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  logout(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.tokenExpiryKey);
    this.currentUserState.set(null);
  }

  private storeSession(response: AuthResponse): void {
    sessionStorage.setItem(this.accessTokenKey, response.accessToken);
    sessionStorage.setItem(this.tokenExpiryKey, response.expiresAtUtc);
    this.currentUserState.set(response.user);
  }
}