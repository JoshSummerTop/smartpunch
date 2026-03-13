import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label text', () => {
    component.status = 'open';
    component.label = 'Open';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.textContent?.trim()).toBe('Open');
  });

  it('should apply red classes for "open" status', () => {
    component.status = 'open';
    component.label = 'Open';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-red-500/20');
    expect(span.classList).toContain('text-red-400');
  });

  it('should apply orange classes for "in_progress" status', () => {
    component.status = 'in_progress';
    component.label = 'In Progress';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-orange-500/20');
    expect(span.classList).toContain('text-orange-400');
  });

  it('should apply green classes for "resolved" status', () => {
    component.status = 'resolved';
    component.label = 'Resolved';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-green-500/20');
    expect(span.classList).toContain('text-green-400');
  });

  it('should apply teal classes for "verified" status', () => {
    component.status = 'verified';
    component.label = 'Verified';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-teal-500/20');
    expect(span.classList).toContain('text-teal-400');
  });

  it('should apply default zinc classes for unknown status', () => {
    component.status = 'unknown';
    component.label = 'Unknown';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-zinc-500/20');
    expect(span.classList).toContain('text-zinc-400');
  });

  it('should have base badge styling classes', () => {
    component.status = 'open';
    component.label = 'Open';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('rounded-full');
    expect(span.classList).toContain('text-xs');
    expect(span.classList).toContain('font-semibold');
  });
});
