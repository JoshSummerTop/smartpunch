import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero section with heading', () => {
    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1).toBeTruthy();
    expect(h1.nativeElement.textContent).toContain('AI-Powered');
    expect(h1.nativeElement.textContent).toContain('Punch List');
    expect(h1.nativeElement.textContent).toContain('Management');
  });

  it('should render how-it-works section with 4 steps', () => {
    const section = fixture.debugElement.query(By.css('#how-it-works'));
    expect(section).toBeTruthy();

    const stepHeadings = section.queryAll(By.css('h3'));
    expect(stepHeadings.length).toBe(4);
    expect(stepHeadings[0].nativeElement.textContent).toContain('Create Project');
    expect(stepHeadings[1].nativeElement.textContent).toContain('Capture Deficiency');
    expect(stepHeadings[2].nativeElement.textContent).toContain('AI Analyzes');
    expect(stepHeadings[3].nativeElement.textContent).toContain('Track & Resolve');
  });

  it('should render feature cards', () => {
    const featureHeadings = fixture.debugElement.queryAll(By.css('h3'));
    const featureTitles = featureHeadings.map(el => el.nativeElement.textContent.trim());
    expect(featureTitles).toContain('AI Photo Analysis');
    expect(featureTitles).toContain('Status Workflow');
    expect(featureTitles).toContain('AI Reports');
  });

  it('should have router links to /dashboard', () => {
    const links = fixture.debugElement.queryAll(By.css('a[routerLink="/dashboard"]'));
    expect(links.length).toBeGreaterThanOrEqual(2); // header link + hero CTA + bottom CTA
  });
});
