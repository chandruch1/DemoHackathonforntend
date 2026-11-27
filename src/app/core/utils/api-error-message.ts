import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  switch (error.status) {
    case 0:
      return 'The service is unavailable. Check your connection and try again.';
    case 400:
      return 'Please check the information you entered and try again.';
    case 401:
      return 'Your session is not authorized. Please sign in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource could not be found.';
    case 409:
      return 'This request conflicts with existing information.';
    default:
      return error.status >= 500
        ? 'The server encountered an error. Please try again later.'
        : fallback;
  }
}
