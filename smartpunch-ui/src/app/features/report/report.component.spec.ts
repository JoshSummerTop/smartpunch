import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ReportComponent } from './report.component';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { createMockProject } from '../../testing/test-helpers';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let router: Router;

  const mockProject = createMockProject({ id: 'proj-1', name: 'Test Project' });
  const mockReportResponse = {
    report: '# Status Report\n\n## Summary\n\nProject is **on track**.\n\n- 5 open items\n- 3 resolved items',
    project_data: {
      total_items: 10,
      open_count: 5,
      resolved_count: 3,
      completion_percentage: 30,
    },
  };

  beforeEach(async () => {
    reportServiceSpy = jasmine.createSpyObj('ReportService', ['generate', 'getPdfUrl']);
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getAll', 'getById', 'create', 'update', 'delete']);

    projectServiceSpy.getById.and.returnValue(of(mockProject));
    reportServiceSpy.generate.and.returnValue(of(mockReportResponse));
    reportServiceSpy.getPdfUrl.and.returnValue('https://api.example.com/projects/proj-1/report/pdf');

    await TestBed.configureTestingModule({
      imports: [ReportComponent],
      providers: [
        provideRouter([]),
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'proj-1' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project on init', () => {
    expect(projectServiceSpy.getById).toHaveBeenCalledWith('proj-1');
    expect(component.project()).toEqual(mockProject);
  });

  it('should set PDF URL on init using ReportService.getPdfUrl', () => {
    expect(reportServiceSpy.getPdfUrl).toHaveBeenCalledWith('proj-1');
    expect(component.pdfUrl).toBe('https://api.example.com/projects/proj-1/report/pdf');
  });

  it('should generate report when generateReport is called', () => {
    expect(component.report()).toBe('');
    expect(component.loading()).toBeFalse();

    component.generateReport();

    expect(reportServiceSpy.generate).toHaveBeenCalledWith('proj-1');
    expect(component.report()).toBe(mockReportResponse.report);
    expect(component.projectData()).toEqual(mockReportResponse.project_data);
    expect(component.loading()).toBeFalse();
  });

  it('should set loading to true during report generation', () => {
    let resolveObs!: (value: typeof mockReportResponse) => void;
    reportServiceSpy.generate.and.returnValue(new Observable(subscriber => {
      resolveObs = (val) => { subscriber.next(val); subscriber.complete(); };
    }));

    component.generateReport();
    expect(component.loading()).toBeTrue();

    resolveObs(mockReportResponse);
    expect(component.loading()).toBeFalse();
  });

  it('should format markdown headings to HTML', () => {
    component.generateReport();

    const html = component.formattedReport();
    expect(html).toContain('<h1');
    expect(html).toContain('Status Report');
    expect(html).toContain('<h2');
    expect(html).toContain('Summary');
  });

  it('should format bold text to HTML strong tags', () => {
    component.generateReport();
    const html = component.formattedReport();
    expect(html).toContain('<strong');
    expect(html).toContain('on track');
  });

  it('should format list items to HTML li tags', () => {
    component.generateReport();
    const html = component.formattedReport();
    expect(html).toContain('<li');
    expect(html).toContain('5 open items');
  });

  it('should navigate back to punch list', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 'proj-1', 'punch-list']);
  });
});
