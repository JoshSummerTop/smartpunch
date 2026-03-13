import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../services/notification.service';

/**
 * Functional HTTP interceptor that:
 * 1. Prepends the API base URL to relative request paths.
 * 2. Sets JSON Accept/Content-Type headers on API requests.
 * 3. Catches HTTP errors and displays user-friendly notifications
 *    based on the response status code.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next handler in the interceptor chain.
 * @returns An observable of the HTTP event stream, with errors caught and re-thrown.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  let apiReq = req;

  // Only prepend the API base URL for relative paths (not absolute URLs like CDN resources)
  if (!req.url.startsWith('http')) {
    apiReq = req.clone({
      url: `${environment.apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
      setHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      // Status 0: network-level failure (CORS block, DNS failure, server unreachable)
      if (error.status === 0) {
        message = 'Unable to connect to the server';
      // Status 422: Laravel validation error — flatten field-level errors into a single string
      } else if (error.status === 422) {
        const errors = error.error?.errors;
        if (errors) {
          message = Object.values(errors).flat().join(', ');
        } else {
          message = error.error?.message || 'Validation failed';
        }
      // Status 404: requested resource does not exist
      } else if (error.status === 404) {
        message = 'Resource not found';
      // Status 5xx: server-side failure
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      notificationService.error(message);
      return throwError(() => error);
    })
  );
};
