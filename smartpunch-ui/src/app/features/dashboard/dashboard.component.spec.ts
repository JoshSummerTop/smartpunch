import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { createMockProject } from '../../testing/test-helpers';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  const mockProjects = [
    createMockProject({ id: 'p1', name: 'Project Alpha', completion_percentage: 80 }),
    createMockProject({ id: 'p2', name: 'Project Beta', completion_percentage: 50 }),
    createMockProject({ id: 'p3', name: 'Project Gamma', completion_percentage: 10 }),
  ];

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getAll', 'create']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning', 'remove']);

    projectServiceSpy.getAll.and.returnValue(of(mockProjects));
    projectServiceSpy.create.and.returnValue(of(mockProjects[0]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(projectServiceSpy.getAll).toHaveBeenCalledWith('');
    expect(component.projects()).toEqual(mockProjects);
    expect(component.loading()).toBeFalse();
  });

  it('should call service with search term when searching', () => {
    projectServiceSpy.getAll.calls.reset();
    component.onSearch('Alpha');
    expect(component.searchTerm()).toBe('Alpha');
    expect(projectServiceSpy.getAll).toHaveBeenCalledWith('Alpha');
  });

  it('should show create modal when New Project button is clicked', () => {
    expect(component.showCreateModal()).toBeFalse();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.showCreateModal()).toBeTrue();
  });

  it('should display project cards with correct health border colors', () => {
    // >70% => green
    expect(component.getHealthBorderClass(80)).toBe('border-green-500/40');
    // 30-70% => orange
    expect(component.getHealthBorderClass(50)).toBe('border-orange-500/40');
    // <30% => red
    expect(component.getHealthBorderClass(10)).toBe('border-red-500/40');
  });

  it('should navigate to punch list when a project card is clicked', () => {
    component.goToProject(mockProjects[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 'p1', 'punch-list']);
  });

  it('should create project and reload list on form submit', () => {
    component.showCreateModal.set(true);
    component.newProject = { name: 'New Project' };
    projectServiceSpy.getAll.calls.reset();

    component.createProject();

    expect(projectServiceSpy.create).toHaveBeenCalledWith({ name: 'New Project' });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Project created successfully');
    expect(component.showCreateModal()).toBeFalse();
    expect(projectServiceSpy.getAll).toHaveBeenCalled();
  });

  it('should not create project when name is empty', () => {
    component.newProject = { name: '' };
    component.createProject();
    expect(projectServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should render project names in cards', () => {
    const cardHeadings = fixture.debugElement.queryAll(By.css('h3'));
    const names = cardHeadings.map(el => el.nativeElement.textContent.trim());
    expect(names).toContain('Project Alpha');
    expect(names).toContain('Project Beta');
    expect(names).toContain('Project Gamma');
  });
});
