import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
      {{ label }}
    </span>
  `
})
/**
 * Standalone component that renders a color-coded pill badge for punch item status.
 * Maps status keys to Tailwind color classes (red=open, orange=in_progress,
 * green=resolved, teal=verified).
 */
export class StatusBadgeComponent {
  /** Machine-readable status key (e.g. "open", "in_progress"). */
  @Input() status: string = '';
  /** Human-readable label displayed inside the badge. */
  @Input() label: string = '';

  /**
   * Computes the Tailwind CSS classes for background and text color based on the status key.
   * @returns A space-separated class string for the badge element.
   */
  get badgeClass(): string {
    switch (this.status) {
      case 'open': return 'bg-red-500/20 text-red-400';
      case 'in_progress': return 'bg-orange-500/20 text-orange-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'verified': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  }
}
