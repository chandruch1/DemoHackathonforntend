import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.status) {
    case 0:
      return 'The service is unavailable. Check your connection and try again.';
    case 400:
      return 'Please check the information you entered and try again.';
    case 401:
      return 'Your session has expired or your credentials are invalid.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested information could not be found.';
    case 409:
      return 'This request conflicts with the current account state.';
    default:
      return error.status >= 500
        ? 'The server encountered an error. Please try again later.'
        : 'The request could not be completed. Please try again.';
  }
}
