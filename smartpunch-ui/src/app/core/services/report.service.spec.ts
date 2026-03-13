import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { environment } from '../../../environments/environment';

describe('ReportService', () => {
  let service: ReportService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ReportService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('generate', () => {
    it('should GET /projects/:id/report', () => {
      const mockResponse = {
        report: '<h1>Project Report</h1><p>Summary here</p>',
        project_data: { name: 'Test Project', items: [] },
      };

      service.generate('proj-1').subscribe(result => {
        expect(result.report).toBe(mockResponse.report);
        expect(result.project_data).toEqual(mockResponse.project_data);
      });

      const req = httpTesting.expectOne('/projects/proj-1/report');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPdfUrl', () => {
    it('should return the correct PDF URL using environment apiUrl', () => {
      const url = service.getPdfUrl('proj-1');
      expect(url).toBe(`${environment.apiUrl}/projects/proj-1/report/pdf`);
    });

    it('should include the project ID in the URL', () => {
      const url = service.getPdfUrl('abc-def-ghi');
      expect(url).toContain('abc-def-ghi');
      expect(url).toMatch(/\/projects\/abc-def-ghi\/report\/pdf$/);
    });
  });
});
