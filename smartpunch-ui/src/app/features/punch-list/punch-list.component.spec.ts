import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PunchListComponent } from './punch-list.component';
import { PunchItemService } from '../../core/services/punch-item.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { createMockProject, createMockPunchItem } from '../../testing/test-helpers';

describe('PunchListComponent', () => {
  let component: PunchListComponent;
  let fixture: ComponentFixture<PunchListComponent>;
  let punchItemServiceSpy: jasmine.SpyObj<PunchItemService>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  const mockProject = createMockProject({ id: 'proj-1' });
  const mockItems = [
    createMockPunchItem({ id: 'item-1', status: 'open', description: 'Crack in wall' }),
    createMockPunchItem({ id: 'item-2', status: 'in_progress', description: 'Leaky faucet' }),
  ];

  beforeEach(async () => {
    punchItemServiceSpy = jasmine.createSpyObj('PunchItemService', [
      'getAll', 'getById', 'create', 'update', 'delete', 'updateStatus', 'bulkStatus',
    ]);
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getAll', 'getById', 'create', 'update', 'delete']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning', 'remove']);

    punchItemServiceSpy.getAll.and.returnValue(of(mockItems));
    punchItemServiceSpy.create.and.returnValue(of(mockItems[0]));
    punchItemServiceSpy.bulkStatus.and.returnValue(of({ updated: ['item-1'], failed: [] }));
    projectServiceSpy.getById.and.returnValue(of(mockProject));

    await TestBed.configureTestingModule({
      imports: [PunchListComponent],
      providers: [
        provideRouter([]),
        { provide: PunchItemService, useValue: punchItemServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'proj-1' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(PunchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project and items on init', () => {
    expect(component.projectId).toBe('proj-1');
    expect(projectServiceSpy.getById).toHaveBeenCalledWith('proj-1');
    expect(punchItemServiceSpy.getAll).toHaveBeenCalledWith('proj-1', {});
    expect(component.project()).toEqual(mockProject);
    expect(component.items()).toEqual(mockItems);
    expect(component.loading()).toBeFalse();
  });

  it('should filter items by status', () => {
    punchItemServiceSpy.getAll.calls.reset();
    component.setStatusFilter('open');
    expect(component.filters.status).toBe('open');
    expect(punchItemServiceSpy.getAll).toHaveBeenCalledWith('proj-1', jasmine.objectContaining({ status: 'open' }));
  });

  it('should clear status filter when empty string passed', () => {
    component.setStatusFilter('open');
    punchItemServiceSpy.getAll.calls.reset();
    component.setStatusFilter('');
    expect(component.filters.status).toBeUndefined();
    expect(punchItemServiceSpy.getAll).toHaveBeenCalled();
  });

  it('should reload items when search text changes', () => {
    punchItemServiceSpy.getAll.calls.reset();
    component.filters.search = 'crack';
    component.loadItems();
    expect(punchItemServiceSpy.getAll).toHaveBeenCalledWith('proj-1', jasmine.objectContaining({ search: 'crack' }));
  });

  it('should apply bulk status to selected items', () => {
    component.selectedItems.set(['item-1', 'item-2']);
    component.bulkStatus = 'in_progress';
    punchItemServiceSpy.getAll.calls.reset();

    component.applyBulkStatus();

    expect(punchItemServiceSpy.bulkStatus).toHaveBeenCalledWith('proj-1', ['item-1', 'item-2'], 'in_progress');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Updated 1 items');
    expect(component.selectedItems()).toEqual([]);
    expect(component.bulkStatus).toBe('');
  });

  it('should not apply bulk status when no items selected', () => {
    component.selectedItems.set([]);
    component.bulkStatus = 'in_progress';
    component.applyBulkStatus();
    expect(punchItemServiceSpy.bulkStatus).not.toHaveBeenCalled();
  });

  it('should not apply bulk status when no status chosen', () => {
    component.selectedItems.set(['item-1']);
    component.bulkStatus = '';
    component.applyBulkStatus();
    expect(punchItemServiceSpy.bulkStatus).not.toHaveBeenCalled();
  });

  it('should create a new item and reload list', () => {
    component.newItem = { description: 'New crack', trade: 'drywall', severity: 'minor' };
    punchItemServiceSpy.getAll.calls.reset();

    component.createItem();

    expect(punchItemServiceSpy.create).toHaveBeenCalledWith('proj-1', {
      description: 'New crack', trade: 'drywall', severity: 'minor',
    });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Punch item created');
    expect(component.showAddItem()).toBeFalse();
    expect(punchItemServiceSpy.getAll).toHaveBeenCalled();
  });

  it('should not create item when required fields are missing', () => {
    component.newItem = { description: '', trade: '', severity: '' };
    component.createItem();
    expect(punchItemServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should handle AI capture item created callback', () => {
    punchItemServiceSpy.getAll.calls.reset();
    projectServiceSpy.getById.calls.reset();

    component.onItemCreated();

    expect(component.showAICapture()).toBeFalse();
    expect(punchItemServiceSpy.getAll).toHaveBeenCalled();
    expect(projectServiceSpy.getById).toHaveBeenCalledWith('proj-1');
  });

  it('should navigate to item detail when card is clicked', () => {
    component.goToItem(mockItems[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 'proj-1', 'punch-list', 'item-1']);
  });

  it('should navigate back to dashboard', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should toggle select mode and clear selection when deactivated', () => {
    component.selectMode.set(false);
    component.selectedItems.set(['item-1']);

    component.toggleSelectMode();
    expect(component.selectMode()).toBeTrue();

    component.toggleSelectMode();
    expect(component.selectMode()).toBeFalse();
    expect(component.selectedItems()).toEqual([]);
  });
});
