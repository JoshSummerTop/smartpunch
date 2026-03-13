import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" (click)="onCancel()"></div>
          <div class="relative bg-surface-card rounded-2xl shadow-xl border border-border-default max-w-md w-full p-6 animate-slide-up">
            <h3 class="text-lg font-semibold text-text-primary mb-2">{{ title }}</h3>
            <p class="text-sm text-text-secondary mb-6">{{ message }}</p>
            <div class="flex justify-end gap-3">
              <button (click)="onCancel()" class="px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover transition-colors">
                Cancel
              </button>
              <button (click)="onConfirm()" class="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
/**
 * Reusable confirmation dialog component.
 * Renders a centered modal overlay with a title, message, and
 * Cancel / Confirm action buttons. Visibility is controlled by the `isOpen` input.
 */
export class ConfirmModalComponent {
  /** Whether the modal is currently visible. */
  @Input() isOpen = false;
  /** Title text shown at the top of the dialog. */
  @Input() title = 'Confirm';
  /** Body message describing what is being confirmed. */
  @Input() message = 'Are you sure?';
  /** Label for the primary action button. */
  @Input() confirmText = 'Confirm';
  /** Emitted when the user clicks the confirm button. */
  @Output() confirmed = new EventEmitter<void>();
  /** Emitted when the user clicks cancel or the backdrop. */
  @Output() cancelled = new EventEmitter<void>();

  /** Emits the `confirmed` event. */
  onConfirm(): void {
    this.confirmed.emit();
  }

  /** Emits the `cancelled` event. */
  onCancel(): void {
    this.cancelled.emit();
  }
}
