import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that formats a numeric "days open" value into a human-readable string.
 * Returns "Today" for 0, "1 day" for 1, and "N days" for all other values.
 */
@Pipe({ name: 'daysOpen', standalone: true })
export class DaysOpenPipe implements PipeTransform {
  /**
   * @param value - Number of days the item has been open.
   * @returns A formatted string (e.g. "Today", "1 day", "5 days").
   */
  transform(value: number): string {
    if (value === 0) return 'Today';
    if (value === 1) return '1 day';
    return `${value} days`;
  }
}
