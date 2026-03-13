import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PunchItemService, PunchItemFilters } from './punch-item.service';
import { CreatePunchItem } from '../models/punch-item.model';
import { createMockPunchItem } from '../../testing/test-helpers';

describe('PunchItemService', () => {
  let service: PunchItemService;
  let httpTesting: HttpTestingController;

  const projectId = 'proj-1';
  const itemId = 'item-1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PunchItemService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /projects/:id/punch-items and unwrap data', () => {
      const mockItems = [createMockPunchItem()];

      service.getAll(projectId).subscribe(items => {
        expect(items).toEqual(mockItems);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockItems });
    });

    it('should pass filter params when provided', () => {
      const filters: PunchItemFilters = {
        trade: 'electrical',
        severity: 'major',
        status: 'open',
        search: 'wiring',
        sort: 'created_at',
        direction: 'desc',
      };

      service.getAll(projectId, filters).subscribe();

      const req = httpTesting.expectOne(r => r.url === `/projects/${projectId}/punch-items`);
      expect(req.request.params.get('trade')).toBe('electrical');
      expect(req.request.params.get('severity')).toBe('major');
      expect(req.request.params.get('status')).toBe('open');
      expect(req.request.params.get('search')).toBe('wiring');
      expect(req.request.params.get('sort')).toBe('created_at');
      expect(req.request.params.get('direction')).toBe('desc');
      req.flush({ data: [] });
    });

    it('should skip falsy filter values', () => {
      const filters: PunchItemFilters = { trade: 'plumbing', severity: '' };

      service.getAll(projectId, filters).subscribe();

      const req = httpTesting.expectOne(r => r.url === `/projects/${projectId}/punch-items`);
      expect(req.request.params.get('trade')).toBe('plumbing');
      expect(req.request.params.has('severity')).toBeFalse();
      req.flush({ data: [] });
    });

    it('should send no params when filters is undefined', () => {
      service.getAll(projectId).subscribe();

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items`);
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ data: [] });
    });
  });

  describe('getById', () => {
    it('should GET /projects/:projectId/punch-items/:itemId and unwrap data', () => {
      const mock = createMockPunchItem({ id: itemId });

      service.getById(projectId, itemId).subscribe(item => {
        expect(item).toEqual(mock);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items/${itemId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mock });
    });
  });

  describe('create', () => {
    it('should POST /projects/:id/punch-items and unwrap data', () => {
      const input: CreatePunchItem = {
        description: 'Cracked tile',
        trade: 'flooring',
        severity: 'minor',
      };
      const mock = createMockPunchItem({ description: 'Cracked tile' });

      service.create(projectId, input).subscribe(item => {
        expect(item).toEqual(mock);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ data: mock });
    });
  });

  describe('update', () => {
    it('should PUT /projects/:projectId/punch-items/:itemId and unwrap data', () => {
      const updates = { description: 'Updated description' };
      const mock = createMockPunchItem({ description: 'Updated description' });

      service.update(projectId, itemId, updates).subscribe(item => {
        expect(item).toEqual(mock);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items/${itemId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ data: mock });
    });
  });

  describe('delete', () => {
    it('should DELETE /projects/:projectId/punch-items/:itemId', () => {
      service.delete(projectId, itemId).subscribe();

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items/${itemId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateStatus', () => {
    it('should PUT /projects/:projectId/punch-items/:itemId/status and unwrap data', () => {
      const mock = createMockPunchItem({ status: 'in_progress' });

      service.updateStatus(projectId, itemId, 'in_progress').subscribe(item => {
        expect(item).toEqual(mock);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items/${itemId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'in_progress' });
      req.flush({ data: mock });
    });
  });

  describe('bulkStatus', () => {
    it('should POST /projects/:projectId/punch-items/bulk-status', () => {
      const itemIds = ['id-1', 'id-2', 'id-3'];
      const mockResponse = { updated: ['id-1', 'id-2', 'id-3'], failed: [] };

      service.bulkStatus(projectId, itemIds, 'resolved').subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items/bulk-status`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ item_ids: itemIds, status: 'resolved' });
      req.flush(mockResponse);
    });

    it('should handle partial failures in bulk status', () => {
      const mockResponse = {
        updated: ['id-1'],
        failed: [{ id: 'id-2', reason: 'Invalid transition' }],
      };

      service.bulkStatus(projectId, ['id-1', 'id-2'], 'resolved').subscribe(result => {
        expect(result.updated.length).toBe(1);
        expect(result.failed.length).toBe(1);
      });

      const req = httpTesting.expectOne(`/projects/${projectId}/punch-items/bulk-status`);
      req.flush(mockResponse);
    });
  });
});
