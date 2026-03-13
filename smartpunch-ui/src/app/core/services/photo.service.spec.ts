import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PhotoService } from './photo.service';

describe('PhotoService', () => {
  let service: PhotoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PhotoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('upload', () => {
    it('should upload a deficiency photo', () => {
      const mockResponse = { path: '/photos/abc.jpg', url: 'https://example.com/photos/abc.jpg' };

      service.upload('item-1', 'base64photodata', 'deficiency').subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne('/photos/item-1');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        photo: 'base64photodata',
        type: 'deficiency',
      });
      req.flush(mockResponse);
    });

    it('should upload a resolution photo', () => {
      const mockResponse = { path: '/photos/def.jpg', url: 'https://example.com/photos/def.jpg' };

      service.upload('item-2', 'base64resdata', 'resolution').subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne('/photos/item-2');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        photo: 'base64resdata',
        type: 'resolution',
      });
      req.flush(mockResponse);
    });
  });
});
