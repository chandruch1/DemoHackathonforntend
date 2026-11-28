import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, UserSummaryDto } from '../models/auth.model';
import { AuthService } from './auth';
import { authInterceptor } from './auth.interceptor';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const credentials: LoginRequest = {
    email: 'customer@example.com',
    password: 'correct horse battery staple'
  };
  const user: UserSummaryDto = {
    userId: 'customer-1',
    fullName: 'Customer',
    email: credentials.email,
    role: 'Customer'
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('uses the configured API URL and stores the returned login session', () => {
    const response: AuthResponse = {
      accessToken: 'api-issued-token',
      tokenType: 'Bearer',
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      user
    };

    service.login(credentials).subscribe(result => {
      expect(result).toEqual(response);
      expect(service.currentUser()).toEqual(user);
      expect(service.getAccessToken()).toBe(response.accessToken);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(response);
  });

  it('sends the stored bearer token to authenticated API calls', () => {
    service.login(credentials).subscribe(() => {
      service.getCurrentUser().subscribe(result => expect(result).toEqual(user));
      const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/me`);
      expect(request.request.headers.get('Authorization')).toBe('Bearer api-issued-token');
      request.flush(user);
    });

    httpTestingController.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 'api-issued-token',
      tokenType: 'Bearer',
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      user
    } satisfies AuthResponse);
  });

  it('clears an expired session before returning a token', () => {
    service.login(credentials).subscribe(() => {
      sessionStorage.setItem(
        'retail-ordering.token-expiry',
        new Date(Date.now() - 1_000).toISOString()
      );

      expect(service.getAccessToken()).toBeNull();
      expect(service.currentUser()).toBeNull();
    });

    httpTestingController.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 'api-issued-token',
      tokenType: 'Bearer',
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      user
    } satisfies AuthResponse);
  });
});
