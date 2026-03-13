import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AIService } from './ai.service';
import { createMockAIResponse } from '../../testing/test-helpers';

describe('AIService', () => {
  let service: AIService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AIService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('analyzeImage', () => {
    it('should POST /ai/analyze with image and mime type', () => {
      const mockResponse = createMockAIResponse();

      service.analyzeImage('base64data', 'image/jpeg').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne('/ai/analyze');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        image: 'base64data',
        mime_type: 'image/jpeg',
        location: undefined,
      });
      req.flush(mockResponse);
    });

    it('should include location when provided', () => {
      const mockResponse = createMockAIResponse();

      service.analyzeImage('base64data', 'image/png', 'Kitchen').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne('/ai/analyze');
      expect(req.request.body).toEqual({
        image: 'base64data',
        mime_type: 'image/png',
        location: 'Kitchen',
      });
      req.flush(mockResponse);
    });

    it('should handle a failed analysis response', () => {
      const mockResponse = createMockAIResponse({
        success: false,
        data: undefined,
        message: 'Could not analyze image',
      });

      service.analyzeImage('baddata', 'image/jpeg').subscribe(response => {
        expect(response.success).toBeFalse();
        expect(response.data).toBeUndefined();
        expect(response.message).toBe('Could not analyze image');
      });

      const req = httpTesting.expectOne('/ai/analyze');
      req.flush(mockResponse);
    });
  });
});
