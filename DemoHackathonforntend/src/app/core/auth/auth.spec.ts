import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
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
