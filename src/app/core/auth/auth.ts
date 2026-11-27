import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  RegisterCustomerRequest,
  LoginRequest,
  UserSummaryDto,
  AuthResponse
} from '../../core/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7000/api/v1/auth';

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
    );
  }

  getCurrentUser(): Observable<UserSummaryDto> {
    return this.http.get<UserSummaryDto>(
      `${this.apiUrl}/me`
    );
  }
}