import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';

// Test host component to provide signal inputs
@Component({
  standalone: true,
  imports: [DatePickerComponent],
  template: `<app-date-picker [value]="dateValue" [placeholder]="placeholder" (dateChange)="onDateChange($event)" />`
})
class TestHostComponent {
  dateValue: string | undefined = undefined;
  placeholder = 'Select a date';
  lastEmitted: string | undefined = undefined;

  onDateChange(value: string | undefined): void {
    this.lastEmitted = value;
  }
}

describe('DatePickerComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  function getPickerEl(): HTMLElement {
    return hostFixture.nativeElement.querySelector('app-date-picker');
  }

  function getTriggerButton(): HTMLButtonElement {
    return getPickerEl().querySelector('button') as HTMLButtonElement;
  }

  function getDropdown(): HTMLElement | null {
    return getPickerEl().querySelector('.absolute.z-50');
  }

  function getMonthLabel(): string {
    const span = getPickerEl().querySelector('.text-sm.font-semibold.text-text-primary');
    return span?.textContent?.trim() ?? '';
  }

  function getNavButtons(): HTMLButtonElement[] {
    const dropdown = getDropdown();
    if (!dropdown) return [];
    // prev and next month buttons are in the month/year header row
    const headerRow = dropdown.querySelector('.flex.items-center.justify-between');
    return Array.from(headerRow?.querySelectorAll('button') ?? []) as HTMLButtonElement[];
  }

  function getDayCells(): HTMLButtonElement[] {
    const dropdown = getDropdown();
    if (!dropdown) return [];
    // Day buttons are inside the 7-col grid (second grid)
    const grids = dropdown.querySelectorAll('.grid.grid-cols-7');
    const dayGrid = grids[1]; // first is day-of-week headers, second is calendar
    return Array.from(dayGrid?.querySelectorAll('button') ?? []) as HTMLButtonElement[];
  }

  it('should create', () => {
    expect(getPickerEl()).toBeTruthy();
  });

  it('should render the trigger button with placeholder text', () => {
    const button = getTriggerButton();
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Select a date');
  });

  it('should show custom placeholder', () => {
    host.placeholder = 'Pick date';
    hostFixture.detectChanges();

    const button = getTriggerButton();
    expect(button.textContent).toContain('Pick date');
  });

  it('should be closed initially', () => {
    expect(getDropdown()).toBeNull();
  });

  it('should open calendar dropdown on trigger click', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    expect(getDropdown()).toBeTruthy();
  });

  it('should close calendar on second trigger click (toggle)', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();
    expect(getDropdown()).toBeTruthy();

    getTriggerButton().click();
    hostFixture.detectChanges();
    expect(getDropdown()).toBeNull();
  });

  it('should navigate to previous month', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    const initialLabel = getMonthLabel();
    const [prevBtn] = getNavButtons();
    prevBtn.click();
    hostFixture.detectChanges();

    const newLabel = getMonthLabel();
    expect(newLabel).not.toBe(initialLabel);
  });

  it('should navigate to next month', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    const initialLabel = getMonthLabel();
    const [, nextBtn] = getNavButtons();
    nextBtn.click();
    hostFixture.detectChanges();

    const newLabel = getMonthLabel();
    expect(newLabel).not.toBe(initialLabel);
  });

  it('should wrap from January to December when going to previous month', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    // Navigate back to January
    const now = new Date();
    const monthsBack = now.getMonth(); // 0-based: Jan = 0 clicks needed if already Jan
    const [prevBtn] = getNavButtons();
    for (let i = 0; i < monthsBack; i++) {
      prevBtn.click();
      hostFixture.detectChanges();
    }

    // Now at January, go back one more
    expect(getMonthLabel()).toContain('January');
    prevBtn.click();
    hostFixture.detectChanges();
    expect(getMonthLabel()).toContain('December');
  });

  it('should emit dateChange when a day is selected', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    const dayCells = getDayCells();
    // Click on the day "15"
    const day15 = dayCells.find(btn => btn.textContent?.trim() === '15');
    expect(day15).toBeTruthy();
    day15!.click();
    hostFixture.detectChanges();

    expect(host.lastEmitted).toBeTruthy();
    expect(host.lastEmitted).toMatch(/^\d{4}-\d{2}-15$/);
  });

  it('should close the dropdown after selecting a day', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    const dayCells = getDayCells();
    const day10 = dayCells.find(btn => btn.textContent?.trim() === '10');
    day10!.click();
    hostFixture.detectChanges();

    expect(getDropdown()).toBeNull();
  });

  it('should display formatted date when value is set', () => {
    host.dateValue = '2026-03-15';
    hostFixture.detectChanges();

    const button = getTriggerButton();
    expect(button.textContent).toContain('March');
    expect(button.textContent).toContain('15');
    expect(button.textContent).toContain('2026');
  });

  it('should show clear button when a value is set and emit undefined on clear', () => {
    host.dateValue = '2026-03-15';
    hostFixture.detectChanges();

    getTriggerButton().click();
    hostFixture.detectChanges();

    const clearBtn = getDropdown()?.querySelector('button:last-child') as HTMLButtonElement | null;
    // Find button with text "Clear"
    const footerBtns = getDropdown()?.querySelectorAll('.border-t button');
    let clearButton: HTMLButtonElement | null = null;
    footerBtns?.forEach(btn => {
      if (btn.textContent?.trim() === 'Clear') clearButton = btn as HTMLButtonElement;
    });

    expect(clearButton).toBeTruthy();
    clearButton!.click();
    hostFixture.detectChanges();

    expect(host.lastEmitted).toBeUndefined();
  });

  it('should close dropdown when clicking outside', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();
    expect(getDropdown()).toBeTruthy();

    // Simulate a document click outside the component
    const outsideEvent = new MouseEvent('click', { bubbles: true });
    document.dispatchEvent(outsideEvent);
    hostFixture.detectChanges();

    expect(getDropdown()).toBeNull();
  });

  it('should render day-of-week headers', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    const dropdown = getDropdown();
    const headers = dropdown?.querySelectorAll('.grid.grid-cols-7.mb-1 div');
    expect(headers?.length).toBe(7);
    expect(headers?.[0].textContent?.trim()).toBe('Su');
    expect(headers?.[6].textContent?.trim()).toBe('Sa');
  });

  it('should select today when Today button is clicked', () => {
    getTriggerButton().click();
    hostFixture.detectChanges();

    const footerBtns = getDropdown()?.querySelectorAll('.border-t button');
    let todayButton: HTMLButtonElement | null = null;
    footerBtns?.forEach(btn => {
      if (btn.textContent?.trim() === 'Today') todayButton = btn as HTMLButtonElement;
    });

    expect(todayButton).toBeTruthy();
    todayButton!.click();
    hostFixture.detectChanges();

    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(host.lastEmitted).toBe(expected);
  });
});
