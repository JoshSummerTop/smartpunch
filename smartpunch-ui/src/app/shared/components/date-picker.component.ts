import { Component, signal, input, output, ElementRef, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Trigger button -->
      <button type="button" (click)="toggle()"
              class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-left flex items-center justify-between transition-colors"
              [class.ring-2]="open()"
              [class.ring-primary]="open()"
              [class.border-primary]="open()">
        <span [class.text-text-primary]="!!value()" [class.text-text-muted]="!value()">
          {{ value() ? formatDisplay(value()!) : placeholder() }}
        </span>
        <svg class="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <!-- Dropdown calendar -->
      @if (open()) {
        <div class="absolute z-50 mt-2 w-72 bg-surface-card border border-border-default rounded-2xl shadow-xl p-4 animate-slide-up">
          <!-- Month/Year header -->
          <div class="flex items-center justify-between mb-3">
            <button type="button" (click)="prevMonth()" class="w-8 h-8 rounded-lg hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-sm font-semibold text-text-primary">{{ monthNames[viewMonth()] }} {{ viewYear() }}</span>
            <button type="button" (click)="nextMonth()" class="w-8 h-8 rounded-lg hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Day-of-week headers -->
          <div class="grid grid-cols-7 mb-1">
            @for (day of dayLabels; track day) {
              <div class="text-center text-[10px] font-medium text-text-muted uppercase py-1">{{ day }}</div>
            }
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7">
            @for (cell of calendarCells(); track $index) {
              @if (cell === 0) {
                <div></div>
              } @else {
                <button type="button"
                        (click)="selectDay(cell)"
                        class="w-9 h-9 mx-auto rounded-lg text-sm transition-colors flex items-center justify-center"
                        [class.text-text-primary]="!isSelected(cell) && !isToday(cell)"
                        [class.text-text-muted]="false"
                        [class.hover:bg-surface-elevated]="!isSelected(cell)"
                        [class.bg-primary]="isSelected(cell)"
                        [class.text-white]="isSelected(cell)"
                        [class.font-semibold]="isSelected(cell) || isToday(cell)"
                        [class.ring-1]="isToday(cell) && !isSelected(cell)"
                        [class.ring-primary]="isToday(cell) && !isSelected(cell)"
                        [class.text-primary]="isToday(cell) && !isSelected(cell)">
                  {{ cell }}
                </button>
              }
            }
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
            <button type="button" (click)="selectToday()" class="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
              Today
            </button>
            @if (value()) {
              <button type="button" (click)="clear()" class="text-xs text-text-muted hover:text-text-secondary font-medium transition-colors">
                Clear
              </button>
            }
          </div>
        </div>
      }
    </div>
  `
})
/**
 * Custom dropdown date picker component with month-by-month navigation.
 * Replaces the native `<input type="date">` to match the Dark Forge design system.
 * Renders a 7-column calendar grid with today highlighting and selected-date indicator.
 */
export class DatePickerComponent implements OnInit {
  private el = inject(ElementRef);

  /** The currently selected date as a YYYY-MM-DD string, or undefined if no date is selected. */
  value = input<string | undefined>(undefined);
  /** Placeholder text shown when no date is selected. */
  placeholder = input('Select a date');
  /** Emits the selected date string (YYYY-MM-DD) or undefined when cleared. */
  dateChange = output<string | undefined>();

  /** Whether the calendar dropdown is currently visible. */
  open = signal(false);
  /** Zero-based month index (0=January) of the currently displayed calendar page. */
  viewMonth = signal(0);
  /** Four-digit year of the currently displayed calendar page. */
  viewYear = signal(2026);
  /** Flat array of day numbers for the calendar grid; 0 values represent empty padding cells before the first day of the month. */
  calendarCells = signal<number[]>([]);

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  /** Initializes the view month/year from the current value or today's date, then builds the grid. */
  ngOnInit(): void {
    const now = new Date();
    if (this.value()) {
      const d = new Date(this.value()! + 'T00:00:00');
      this.viewMonth.set(d.getMonth());
      this.viewYear.set(d.getFullYear());
    } else {
      this.viewMonth.set(now.getMonth());
      this.viewYear.set(now.getFullYear());
    }
    this.buildCalendar();
  }

  /**
   * Closes the dropdown when the user clicks outside the component.
   * @param event - The document-level click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  /** Toggles the calendar dropdown open/closed; rebuilds the grid when opening. */
  toggle(): void {
    this.open.update(v => !v);
    if (this.open()) {
      this.buildCalendar();
    }
  }

  /** Navigates the calendar view to the previous month, wrapping to December of the prior year if needed. */
  prevMonth(): void {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update(y => y - 1);
    } else {
      this.viewMonth.update(m => m - 1);
    }
    this.buildCalendar();
  }

  /** Navigates the calendar view to the next month, wrapping to January of the next year if needed. */
  nextMonth(): void {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update(y => y + 1);
    } else {
      this.viewMonth.update(m => m + 1);
    }
    this.buildCalendar();
  }

  /**
   * Builds the flat array of calendar cells for the current view month/year.
   * Leading zeros pad the grid so that day 1 falls under the correct day-of-week column.
   */
  buildCalendar(): void {
    // getDay() returns 0=Sunday..6=Saturday; this determines how many blank cells to prepend
    const firstDay = new Date(this.viewYear(), this.viewMonth(), 1).getDay();
    const daysInMonth = new Date(this.viewYear(), this.viewMonth() + 1, 0).getDate();
    const cells: number[] = [];
    // Pad with zeros so the first day aligns to the correct weekday column
    for (let i = 0; i < firstDay; i++) cells.push(0);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    this.calendarCells.set(cells);
  }

  /**
   * Selects a specific day, formats it as YYYY-MM-DD, emits the value, and closes the dropdown.
   * @param day - The day-of-month number to select.
   */
  selectDay(day: number): void {
    const m = String(this.viewMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${this.viewYear()}-${m}-${d}`;
    this.dateChange.emit(dateStr);
    this.open.set(false);
  }

  /** Navigates to today's month/year and selects today's date. */
  selectToday(): void {
    const now = new Date();
    this.viewMonth.set(now.getMonth());
    this.viewYear.set(now.getFullYear());
    this.buildCalendar();
    this.selectDay(now.getDate());
  }

  /** Clears the selected date by emitting undefined and closing the dropdown. */
  clear(): void {
    this.dateChange.emit(undefined);
    this.open.set(false);
  }

  /**
   * Checks whether a given day matches the currently selected date.
   * @param day - The day-of-month to check.
   * @returns True if this day is the selected date in the current view month/year.
   */
  isSelected(day: number): boolean {
    if (!this.value()) return false;
    const m = String(this.viewMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return this.value() === `${this.viewYear()}-${m}-${d}`;
  }

  /**
   * Checks whether a given day is today's date in the current view month/year.
   * @param day - The day-of-month to check.
   * @returns True if this day matches today.
   */
  isToday(day: number): boolean {
    const now = new Date();
    return day === now.getDate() && this.viewMonth() === now.getMonth() && this.viewYear() === now.getFullYear();
  }

  /**
   * Formats a YYYY-MM-DD date string for display in the trigger button.
   * @param dateStr - The date string to format.
   * @returns A localized long-form date (e.g. "March 15, 2026").
   */
  formatDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}
