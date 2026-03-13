import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
      {{ label }}
    </span>
  `
})
/**
 * Standalone component that renders a color-coded pill badge for punch item severity.
 * Maps severity keys to Tailwind color classes (red=critical, orange=major,
 * yellow=minor, blue=cosmetic).
 */
export class SeverityBadgeComponent {
  /** Machine-readable severity key (e.g. "critical", "minor"). */
  @Input() severity: string = '';
  /** Human-readable label displayed inside the badge. */
  @Input() label: string = '';

  /**
   * Computes the Tailwind CSS classes for background and text color based on the severity key.
   * @returns A space-separated class string for the badge element.
   */
  get badgeClass(): string {
    switch (this.severity) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'major': return 'bg-orange-500/20 text-orange-400';
      case 'minor': return 'bg-yellow-500/20 text-yellow-400';
      case 'cosmetic': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  }
}
