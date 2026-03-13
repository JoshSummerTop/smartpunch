import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PunchItemDetailComponent } from './punch-item-detail.component';
import { PunchItemService } from '../../core/services/punch-item.service';
import { PhotoService } from '../../core/services/photo.service';
import { NotificationService } from '../../core/services/notification.service';
import { createMockPunchItem } from '../../testing/test-helpers';

describe('PunchItemDetailComponent', () => {
  let component: PunchItemDetailComponent;
  let fixture: ComponentFixture<PunchItemDetailComponent>;
  let punchItemServiceSpy: jasmine.SpyObj<PunchItemService>;
  let photoServiceSpy: jasmine.SpyObj<PhotoService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  const mockItem = createMockPunchItem({
    id: 'item-1',
    project_id: 'proj-1',
    description: 'Cracked drywall',
    location: 'Room 101',
    assigned_to: 'John',
    trade: 'drywall',
    severity: 'major',
    suggested_action: 'Patch it',
  });

  const updatedItem = createMockPunchItem({
    ...mockItem,
    description: 'Updated description',
  });

  beforeEach(async () => {
    punchItemServiceSpy = jasmine.createSpyObj('PunchItemService', [
      'getAll', 'getById', 'create', 'update', 'delete', 'updateStatus', 'bulkStatus',
    ]);
    photoServiceSpy = jasmine.createSpyObj('PhotoService', ['upload']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning', 'remove']);

    punchItemServiceSpy.getById.and.returnValue(of(mockItem));
    punchItemServiceSpy.update.and.returnValue(of(updatedItem));
    punchItemServiceSpy.updateStatus.and.returnValue(of(
      createMockPunchItem({ ...mockItem, status: 'in_progress', status_label: 'In Progress' })
    ));
    punchItemServiceSpy.delete.and.returnValue(of(void 0));
    photoServiceSpy.upload.and.returnValue(of({ path: '/photos/test.jpg', url: 'https://example.com/test.jpg' }));

    await TestBed.configureTestingModule({
      imports: [PunchItemDetailComponent],
      providers: [
        provideRouter([]),
        { provide: PunchItemService, useValue: punchItemServiceSpy },
        { provide: PhotoService, useValue: photoServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'proj-1', itemId: 'item-1' } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(PunchItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load item on init', () => {
    expect(punchItemServiceSpy.getById).toHaveBeenCalledWith('proj-1', 'item-1');
    expect(component.item()).toEqual(mockItem);
    expect(component.loading()).toBeFalse();
    expect(component.projectId).toBe('proj-1');
    expect(component.itemId).toBe('item-1');
  });

  it('should populate editData from loaded item', () => {
    expect(component.editData.description).toBe('Cracked drywall');
    expect(component.editData.location).toBe('Room 101');
    expect(component.editData.assigned_to).toBe('John');
    expect(component.editData.trade).toBe('drywall');
    expect(component.editData.severity).toBe('major');
    expect(component.editData.suggested_action).toBe('Patch it');
  });

  it('should save field via inline edit when value changes', () => {
    component.editData.description = 'New description';
    component.saveField('description');

    expect(punchItemServiceSpy.update).toHaveBeenCalledWith('proj-1', 'item-1', { description: 'New description' });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Updated successfully');
  });

  it('should not save field when value has not changed', () => {
    // editData.description is already 'Cracked drywall' from loadItem
    component.saveField('description');
    expect(punchItemServiceSpy.update).not.toHaveBeenCalled();
  });

  it('should call updateStatus on status transition', () => {
    component.updateStatus('in_progress');

    expect(punchItemServiceSpy.updateStatus).toHaveBeenCalledWith('proj-1', 'item-1', 'in_progress');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Status updated to In Progress');
  });

  it('should upload resolution photo via PhotoService', () => {
    punchItemServiceSpy.getById.calls.reset();
    component.onResolutionPhoto({
      base64: 'photodata',
      mimeType: 'image/jpeg',
      preview: 'data:image/jpeg;base64,photodata',
    });

    expect(photoServiceSpy.upload).toHaveBeenCalledWith('item-1', 'photodata', 'resolution');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Resolution photo uploaded');
    expect(component.showResolutionUpload()).toBeFalse();
    expect(punchItemServiceSpy.getById).toHaveBeenCalled(); // reload item
  });

  it('should delete item and navigate back', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteItem();

    expect(punchItemServiceSpy.delete).toHaveBeenCalledWith('proj-1', 'item-1');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Item deleted');
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 'proj-1', 'punch-list']);
  });

  it('should not delete item when user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteItem();
    expect(punchItemServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should navigate back to punch list', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 'proj-1', 'punch-list']);
  });

  it('should return correct transition CSS classes', () => {
    const classes = component.getTransitionClasses('in_progress');
    expect(classes['border-orange-500/30 text-orange-400 bg-orange-500/10']).toBeTrue();

    const resolved = component.getTransitionClasses('resolved');
    expect(resolved['border-green-500/30 text-green-400 bg-green-500/10']).toBeTrue();
  });

  it('should format action strings correctly', () => {
    expect(component.formatAction('status_change')).toBe('Status Change');
    expect(component.formatAction('field_update')).toBe('Field Update');
  });
});
