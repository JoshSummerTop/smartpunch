import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { apiInterceptor } from './api.interceptor';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('URL prepending', () => {
    it('should prepend apiUrl to relative paths starting with /', () => {
      http.get('/projects').subscribe();

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      expect(req.request.url).toBe(`${environment.apiUrl}/projects`);
      req.flush([]);
    });

    it('should prepend apiUrl to relative paths without leading /', () => {
      http.get('projects').subscribe();

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      expect(req.request.url).toBe(`${environment.apiUrl}/projects`);
      req.flush([]);
    });

    it('should NOT prepend apiUrl to absolute URLs', () => {
      http.get('https://external-api.com/data').subscribe();

      const req = httpTesting.expectOne('https://external-api.com/data');
      expect(req.request.url).toBe('https://external-api.com/data');
      req.flush([]);
    });

    it('should NOT prepend apiUrl to http:// URLs', () => {
      http.get('http://other-service.com/items').subscribe();

      const req = httpTesting.expectOne('http://other-service.com/items');
      req.flush([]);
    });
  });

  describe('headers', () => {
    it('should set Accept and Content-Type headers on relative URLs', () => {
      http.get('/projects').subscribe();

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush([]);
    });

    it('should NOT set custom headers on absolute URLs', () => {
      http.get('https://external-api.com/data').subscribe();

      const req = httpTesting.expectOne('https://external-api.com/data');
      expect(req.request.headers.has('Accept')).toBeFalse();
      req.flush([]);
    });
  });

  describe('error handling', () => {
    it('should show network error notification for status 0', () => {
      spyOn(notificationService, 'error');

      http.get('/projects').subscribe({
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(0);
        },
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(notificationService.error).toHaveBeenCalledWith('Unable to connect to the server');
    });

    it('should show not found notification for status 404', () => {
      spyOn(notificationService, 'error');

      http.get('/projects/missing').subscribe({
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(404);
        },
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects/missing`);
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

      expect(notificationService.error).toHaveBeenCalledWith('Resource not found');
    });

    it('should show validation errors for status 422 with errors object', () => {
      spyOn(notificationService, 'error');

      http.post('/projects', {}).subscribe({
        error: () => {},
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush(
        { errors: { name: ['Name is required'], status: ['Invalid status'] } },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(notificationService.error).toHaveBeenCalledWith('Name is required, Invalid status');
    });

    it('should show fallback message for 422 without errors object', () => {
      spyOn(notificationService, 'error');

      http.post('/projects', {}).subscribe({
        error: () => {},
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush(
        { message: 'Validation failed' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(notificationService.error).toHaveBeenCalledWith('Validation failed');
    });

    it('should show generic validation message for 422 with no message or errors', () => {
      spyOn(notificationService, 'error');

      http.post('/projects', {}).subscribe({
        error: () => {},
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush({}, { status: 422, statusText: 'Unprocessable Entity' });

      expect(notificationService.error).toHaveBeenCalledWith('Validation failed');
    });

    it('should show server error notification for status 500', () => {
      spyOn(notificationService, 'error');

      http.get('/projects').subscribe({
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(500);
        },
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(notificationService.error).toHaveBeenCalledWith('Server error. Please try again later.');
    });

    it('should show server error for other 5xx statuses', () => {
      spyOn(notificationService, 'error');

      http.get('/projects').subscribe({
        error: () => {},
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush(null, { status: 503, statusText: 'Service Unavailable' });

      expect(notificationService.error).toHaveBeenCalledWith('Server error. Please try again later.');
    });

    it('should re-throw the error so subscribers can handle it', () => {
      let receivedError: HttpErrorResponse | undefined;

      http.get('/projects').subscribe({
        error: (err: HttpErrorResponse) => {
          receivedError = err;
        },
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(receivedError).toBeDefined();
      expect(receivedError!.status).toBe(500);
    });

    it('should show unexpected error for unhandled status codes', () => {
      spyOn(notificationService, 'error');

      http.get('/projects').subscribe({
        error: () => {},
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      req.flush(null, { status: 403, statusText: 'Forbidden' });

      expect(notificationService.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });
});
