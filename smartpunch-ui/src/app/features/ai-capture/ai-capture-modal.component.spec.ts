import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AICaptureModalComponent } from './ai-capture-modal.component';
import { AIService } from '../../core/services/ai.service';
import { PunchItemService } from '../../core/services/punch-item.service';
import { NotificationService } from '../../core/services/notification.service';
import { createMockAIResponse, createMockPunchItem } from '../../testing/test-helpers';

describe('AICaptureModalComponent', () => {
  let component: AICaptureModalComponent;
  let fixture: ComponentFixture<AICaptureModalComponent>;
  let aiServiceSpy: jasmine.SpyObj<AIService>;
  let punchItemServiceSpy: jasmine.SpyObj<PunchItemService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    aiServiceSpy = jasmine.createSpyObj('AIService', ['analyzeImage']);
    punchItemServiceSpy = jasmine.createSpyObj('PunchItemService', [
      'getAll', 'getById', 'create', 'update', 'delete', 'updateStatus', 'bulkStatus',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning', 'remove']);

    aiServiceSpy.analyzeImage.and.returnValue(of(createMockAIResponse()));
    punchItemServiceSpy.create.and.returnValue(of(createMockPunchItem()));

    await TestBed.configureTestingModule({
      imports: [AICaptureModalComponent],
      providers: [
        { provide: AIService, useValue: aiServiceSpy },
        { provide: PunchItemService, useValue: punchItemServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AICaptureModalComponent);
    component = fixture.componentInstance;
    component.projectId = 'proj-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the upload step', () => {
    expect(component.step()).toBe('upload');
  });

  it('should move through 3-step flow: upload -> analyzing -> results on success', () => {
    component.photoBase64 = 'base64data';
    component.photoMimeType = 'image/jpeg';

    component.analyze();

    expect(component.step()).toBe('results');
    expect(aiServiceSpy.analyzeImage).toHaveBeenCalledWith('base64data', 'image/jpeg', undefined);
  });

  it('should pass location to AI service when provided', () => {
    component.photoBase64 = 'base64data';
    component.photoMimeType = 'image/jpeg';
    component.location = 'Unit 4B';

    component.analyze();

    expect(aiServiceSpy.analyzeImage).toHaveBeenCalledWith('base64data', 'image/jpeg', 'Unit 4B');
  });

  it('should populate result item with AI response data on success', () => {
    component.photoBase64 = 'base64data';
    component.photoMimeType = 'image/jpeg';

    component.analyze();

    expect(component.resultItem.description).toBe('Water damage on ceiling tile');
    expect(component.resultItem.trade).toBe('plumbing');
    expect(component.resultItem.severity).toBe('major');
    expect(component.resultItem.suggested_action).toBe('Replace ceiling tile and inspect for leaks above');
    expect(component.aiError()).toBe('');
  });

  it('should show error and move to results when AI response is unsuccessful', () => {
    aiServiceSpy.analyzeImage.and.returnValue(of({
      success: false,
      message: 'Could not analyze image',
    }));

    component.photoBase64 = 'base64data';
    component.photoMimeType = 'image/jpeg';
    component.analyze();

    expect(component.step()).toBe('results');
    expect(component.aiError()).toBe('Could not analyze image');
    expect(component.resultItem.description).toBe('');
  });

  it('should show error and move to results on HTTP failure', () => {
    aiServiceSpy.analyzeImage.and.returnValue(throwError(() => ({
      error: { message: 'Server error' },
    })));

    component.photoBase64 = 'base64data';
    component.photoMimeType = 'image/jpeg';
    component.analyze();

    expect(component.step()).toBe('results');
    expect(component.aiError()).toBe('Server error');
  });

  it('should show generic error message when HTTP error has no message', () => {
    aiServiceSpy.analyzeImage.and.returnValue(throwError(() => ({
      error: {},
    })));

    component.photoBase64 = 'base64data';
    component.photoMimeType = 'image/jpeg';
    component.analyze();

    expect(component.aiError()).toBe('Unable to connect to AI service');
  });

  it('should not analyze when no photo is set', () => {
    component.photoBase64 = '';
    component.analyze();
    expect(aiServiceSpy.analyzeImage).not.toHaveBeenCalled();
    expect(component.step()).toBe('upload');
  });

  it('should save item and emit itemCreated event', () => {
    spyOn(component.itemCreated, 'emit');
    component.resultItem = {
      description: 'Test issue',
      trade: 'electrical',
      severity: 'critical',
    };

    component.saveItem();

    expect(punchItemServiceSpy.create).toHaveBeenCalledWith('proj-1', component.resultItem);
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Punch item created from AI analysis');
    expect(component.itemCreated.emit).toHaveBeenCalled();
  });

  it('should not save item when required fields are missing', () => {
    component.resultItem = { description: '', trade: '', severity: '' };
    component.saveItem();
    expect(punchItemServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should emit closed event when close is called', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should store photo data when onPhotoSelected is called', () => {
    component.onPhotoSelected({
      base64: 'newbase64',
      mimeType: 'image/png',
      preview: 'data:image/png;base64,newbase64',
    });

    expect(component.photoBase64).toBe('newbase64');
    expect(component.photoMimeType).toBe('image/png');
    expect(component.photoPreview).toBe('data:image/png;base64,newbase64');
  });

  it('should compute correct step index', () => {
    expect(component.getStepIndex('upload')).toBe(0);
    expect(component.getStepIndex('analyzing')).toBe(1);
    expect(component.getStepIndex('results')).toBe(2);
  });
});
