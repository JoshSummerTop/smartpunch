import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { AppComponent } from './app.component';
import { NotificationService } from './core/services/notification.service';

/** Blank component used as a route target in tests. */
@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning', 'remove'], {
      notifications: jasmine.createSpy('notifications').and.returnValue([]),
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'dashboard', component: DummyComponent },
          { path: 'projects/:id/punch-list', component: DummyComponent },
          { path: 'projects/:id/punch-list/:itemId', component: DummyComponent },
          { path: 'projects/:id/report', component: DummyComponent },
        ]),
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide header on landing page (root URL)', async () => {
    // Navigate to root
    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(component.isLandingPage()).toBeTrue();
    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeNull();
  });

  it('should show header on non-landing pages', async () => {
    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();

    expect(component.isLandingPage()).toBeFalse();
    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeTruthy();
  });

  it('should extract project ID from URL', async () => {
    await router.navigateByUrl('/projects/abc-123/punch-list');
    fixture.detectChanges();

    expect(component.activeProjectId()).toBe('abc-123');
  });

  it('should clear project ID when not on a project URL', async () => {
    await router.navigateByUrl('/projects/abc-123/punch-list');
    fixture.detectChanges();
    expect(component.activeProjectId()).toBe('abc-123');

    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();
    expect(component.activeProjectId()).toBe('');
  });

  it('should set showAICapture to true when openAICapture is called with active project', async () => {
    await router.navigateByUrl('/projects/abc-123/punch-list');
    fixture.detectChanges();

    component.openAICapture();
    expect(component.showAICapture()).toBeTrue();
  });

  it('should not open AI capture when no active project', async () => {
    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();

    component.openAICapture();
    expect(component.showAICapture()).toBeFalse();
  });

  it('should detect punch list page', async () => {
    await router.navigateByUrl('/projects/abc-123/punch-list');
    fixture.detectChanges();

    expect(component.isOnPunchList()).toBeTrue();
    expect(component.isOnReport()).toBeFalse();
  });

  it('should detect report page', async () => {
    await router.navigateByUrl('/projects/abc-123/report');
    fixture.detectChanges();

    expect(component.isOnReport()).toBeTrue();
    expect(component.isOnPunchList()).toBeFalse();
  });

  it('should close AI capture and refresh on onAICaptureComplete', () => {
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    component.showAICapture.set(true);

    component.onAICaptureComplete();

    expect(component.showAICapture()).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { skipLocationChange: true });
  });

  it('should clean up subscription on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
