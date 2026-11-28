import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthResponse, LoginRequest, UserSummaryDto } from '../../core/models/auth.model';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const user: UserSummaryDto = {
    userId: 'customer-1',
    fullName: 'Test Customer',
    email: 'customer@example.com',
    phone: '9876543210',
    role: 'Customer'
  };
  const credentials: LoginRequest = {
    email: user.email,
    password: 'password'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
  });

  afterEach(() => {
    if (httpTestingController) httpTestingController.verify();
    localStorage.clear();
  });

  it('stores the returned user and token after login', () => {
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
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

  it('loads the signed-in user and includes the bearer token', () => {
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    const response: AuthResponse = {
      accessToken: 'stored-token',
      tokenType: 'Bearer',
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      user
    };

    service.login(credentials).subscribe(() => {
      service.getCurrentUser().subscribe(result => {
        expect(result).toEqual(user);
        expect(service.currentUser()).toEqual(user);
      });
    });

    httpTestingController.expectOne(`${environment.apiUrl}/auth/login`).flush(response);
    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/me`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer stored-token');
    request.flush(user);
  });

  it('clears an expired session before returning a token', () => {
    localStorage.setItem('retail_token', 'expired-token');
    localStorage.setItem('retail_expires_at', String(Date.now() - 1_000));
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);

    expect(service.getAccessToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('retail_token')).toBeNull();
  });
});
