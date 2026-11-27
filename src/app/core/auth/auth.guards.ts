import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, throwError } from 'rxjs';

import { AuthService } from './auth';

function loginRedirect(router: Router, returnUrl: string) {
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl }
  });
}

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return loginRedirect(router, state.url);
  }

  if (authService.currentUser()) {
    return true;
  }

  return authService.getCurrentUser().pipe(
    map(() => true),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return of(loginRedirect(router, state.url));
      }

      return throwError(() => error);
    })
  );
};

export const adminRoleGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return loginRedirect(router, state.url);
  }

  const user = authService.currentUser();
  if (user) {
    return user.role === 'Admin' ? true : router.createUrlTree(['/']);
  }

  return authService.getCurrentUser().pipe(
    map(currentUser =>
      currentUser.role === 'Admin' ? true : router.createUrlTree(['/'])
    ),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return of(loginRedirect(router, state.url));
      }

      return throwError(() => error);
    })
  );
};
