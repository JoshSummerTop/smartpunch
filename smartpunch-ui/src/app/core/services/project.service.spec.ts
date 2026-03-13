import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { Project, CreateProject } from '../models/project.model';
import { createMockProject } from '../../testing/test-helpers';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProjectService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /projects and unwrap data', () => {
      const mockProjects = [createMockProject(), createMockProject({ id: 'p2', name: 'Second' })];

      service.getAll().subscribe(projects => {
        expect(projects).toEqual(mockProjects);
        expect(projects.length).toBe(2);
      });

      const req = httpTesting.expectOne('/projects');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProjects });
    });

    it('should pass search param when provided', () => {
      service.getAll('kitchen').subscribe();

      const req = httpTesting.expectOne(r => r.url === '/projects');
      expect(req.request.params.get('search')).toBe('kitchen');
      expect(req.request.params.has('status')).toBeFalse();
      req.flush({ data: [] });
    });

    it('should pass status param when provided', () => {
      service.getAll(undefined, 'in_progress').subscribe();

      const req = httpTesting.expectOne(r => r.url === '/projects');
      expect(req.request.params.get('status')).toBe('in_progress');
      expect(req.request.params.has('search')).toBeFalse();
      req.flush({ data: [] });
    });

    it('should pass both search and status params', () => {
      service.getAll('roof', 'completed').subscribe();

      const req = httpTesting.expectOne(r => r.url === '/projects');
      expect(req.request.params.get('search')).toBe('roof');
      expect(req.request.params.get('status')).toBe('completed');
      req.flush({ data: [] });
    });

    it('should not set params when values are empty strings', () => {
      service.getAll('', '').subscribe();

      const req = httpTesting.expectOne('/projects');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ data: [] });
    });
  });

  describe('getById', () => {
    it('should GET /projects/:id and unwrap data', () => {
      const mock = createMockProject({ id: 'abc-123' });

      service.getById('abc-123').subscribe(project => {
        expect(project).toEqual(mock);
      });

      const req = httpTesting.expectOne('/projects/abc-123');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mock });
    });
  });

  describe('create', () => {
    it('should POST /projects and unwrap data', () => {
      const input: CreateProject = { name: 'New Project', address: '456 Main St' };
      const mock = createMockProject({ name: 'New Project', address: '456 Main St' });

      service.create(input).subscribe(project => {
        expect(project).toEqual(mock);
      });

      const req = httpTesting.expectOne('/projects');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ data: mock });
    });
  });

  describe('update', () => {
    it('should PUT /projects/:id and unwrap data', () => {
      const updates = { name: 'Updated Name' };
      const mock = createMockProject({ name: 'Updated Name' });

      service.update('proj-1', updates).subscribe(project => {
        expect(project).toEqual(mock);
      });

      const req = httpTesting.expectOne('/projects/proj-1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ data: mock });
    });
  });

  describe('delete', () => {
    it('should DELETE /projects/:id', () => {
      service.delete('proj-1').subscribe();

      const req = httpTesting.expectOne('/projects/proj-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
