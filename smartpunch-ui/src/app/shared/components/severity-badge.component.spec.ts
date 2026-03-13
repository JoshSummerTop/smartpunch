import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeverityBadgeComponent } from './severity-badge.component';

describe('SeverityBadgeComponent', () => {
  let component: SeverityBadgeComponent;
  let fixture: ComponentFixture<SeverityBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeverityBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SeverityBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label text', () => {
    component.severity = 'critical';
    component.label = 'Critical';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.textContent?.trim()).toBe('Critical');
  });

  it('should apply red classes for "critical" severity', () => {
    component.severity = 'critical';
    component.label = 'Critical';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-red-500/20');
    expect(span.classList).toContain('text-red-400');
  });

  it('should apply orange classes for "major" severity', () => {
    component.severity = 'major';
    component.label = 'Major';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-orange-500/20');
    expect(span.classList).toContain('text-orange-400');
  });

  it('should apply yellow classes for "minor" severity', () => {
    component.severity = 'minor';
    component.label = 'Minor';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-yellow-500/20');
    expect(span.classList).toContain('text-yellow-400');
  });

  it('should apply blue classes for "cosmetic" severity', () => {
    component.severity = 'cosmetic';
    component.label = 'Cosmetic';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-blue-500/20');
    expect(span.classList).toContain('text-blue-400');
  });

  it('should apply default zinc classes for unknown severity', () => {
    component.severity = 'unknown';
    component.label = 'Unknown';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('bg-zinc-500/20');
    expect(span.classList).toContain('text-zinc-400');
  });

  it('should have base badge styling classes', () => {
    component.severity = 'critical';
    component.label = 'Critical';
    fixture.detectChanges();

    const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('rounded-full');
    expect(span.classList).toContain('text-xs');
    expect(span.classList).toContain('font-semibold');
  });
});
