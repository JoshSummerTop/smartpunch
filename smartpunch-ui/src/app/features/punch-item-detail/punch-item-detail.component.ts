import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PunchItemService } from '../../core/services/punch-item.service';
import { PhotoService } from '../../core/services/photo.service';
import { NotificationService } from '../../core/services/notification.service';
import { PunchItem } from '../../core/models/punch-item.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge.component';
import { PhotoUploadComponent } from '../../shared/components/photo-upload.component';
import { DaysOpenPipe } from '../../shared/pipes/days-open.pipe';

@Component({
  selector: 'app-punch-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, SeverityBadgeComponent, PhotoUploadComponent, DaysOpenPipe],
  template: `
    <div class="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto bg-surface-base min-h-full">
      <button (click)="goBack()" class="text-sm text-text-muted hover:text-primary flex items-center gap-1 mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Punch List
      </button>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }

      @if (item()) {
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

          <!-- LEFT COLUMN — photos + fields (3/5 on desktop) -->
          <div class="lg:col-span-3 space-y-4 md:space-y-5">
            <!-- Photos -->
            @if (item()!.photo_url) {
              <div class="-mx-4 md:mx-0">
                <img [src]="item()!.photo_url" class="w-full md:max-w-2xl md:rounded-2xl md:shadow-lg object-cover max-h-80" alt="Deficiency">
              </div>
            }

            <!-- Header Card -->
            <div class="bg-surface-card rounded-2xl border border-border-default p-4 md:p-5">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs text-text-muted bg-surface-elevated px-2 py-1 rounded-lg">{{ item()!.item_number }}</span>
                  <span class="text-xs text-text-muted">{{ item()!.days_open | daysOpen }} open</span>
                </div>
                <div class="flex items-center gap-2">
                  <app-severity-badge [severity]="item()!.severity" [label]="item()!.severity_label" />
                  <app-status-badge [status]="item()!.status" [label]="item()!.status_label" />
                </div>
              </div>

              <!-- Status Transitions -->
              @if (item()!.allowed_transitions.length > 0) {
                <div class="pt-4 border-t border-border-default">
                  <span class="text-xs text-text-muted block mb-2">Move to:</span>
                  <div class="flex flex-col md:flex-row gap-2">
                    @for (transition of item()!.allowed_transitions; track transition.value) {
                      <button (click)="updateStatus(transition.value)"
                              class="flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors"
                              [ngClass]="getTransitionClasses(transition.value)">
                        {{ transition.label }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Editable Fields Card -->
            <div class="bg-surface-card rounded-2xl border border-border-default p-4 md:p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea [(ngModel)]="editData.description" (blur)="saveField('description')" rows="3"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Location</label>
                  <input type="text" [(ngModel)]="editData.location" (blur)="saveField('location')"
                         class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Assigned To</label>
                  <input type="text" [(ngModel)]="editData.assigned_to" (blur)="saveField('assigned_to')"
                         class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Trade</label>
                  <select [(ngModel)]="editData.trade" (change)="saveField('trade')"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                    @for (t of trades; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Severity</label>
                  <select [(ngModel)]="editData.severity" (change)="saveField('severity')"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="cosmetic">Cosmetic</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1">Suggested Action</label>
                <textarea [(ngModel)]="editData.suggested_action" (blur)="saveField('suggested_action')" rows="2"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
              </div>
            </div>

            <!-- Resolution Photo Card -->
            <div class="bg-surface-card rounded-2xl border border-border-default p-4 md:p-5">
              <h3 class="text-sm font-semibold text-text-primary mb-3">Resolution Photo</h3>
              @if (item()!.resolution_photo_url) {
                <img [src]="item()!.resolution_photo_url" class="w-full rounded-xl object-cover max-h-64" alt="Resolution">
              } @else {
                @if (!showResolutionUpload()) {
                  <button (click)="showResolutionUpload.set(true)"
                          class="w-full bg-surface-elevated rounded-xl p-6 text-center text-sm text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors border border-border-default">
                    + Add Resolution Photo
                  </button>
                } @else {
                  <app-photo-upload (photoSelected)="onResolutionPhoto($event)" />
                }
              }
            </div>
          </div>

          <!-- RIGHT COLUMN — activity + danger (2/5 on desktop) -->
          <div class="lg:col-span-2 space-y-4 md:space-y-5">

          <!-- Activity Log Card -->
          <div class="bg-surface-card rounded-2xl border border-border-default p-4 md:p-5">
            <h3 class="text-sm font-display font-bold text-text-primary mb-4">Activity Log</h3>
            <div class="relative space-y-0">
              @for (log of item()!.activity_logs; track log.id; let last = $last) {
                <div class="flex gap-3 relative pb-4" [class.pb-0]="last">
                  <!-- Timeline line -->
                  @if (!last) {
                    <div class="absolute left-[3px] top-3 bottom-0 w-px bg-border-default"></div>
                  }
                  <!-- Color-coded dot -->
                  <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 relative z-10"
                       [class.bg-green-400]="log.action === 'status_change' && log.new_value === 'resolved'"
                       [class.bg-orange-400]="log.action === 'status_change' && log.new_value === 'in_progress'"
                       [class.bg-teal-400]="log.action === 'status_change' && log.new_value === 'verified'"
                       [class.bg-blue-400]="log.action === 'field_update'"
                       [class.bg-primary]="log.action !== 'status_change' && log.action !== 'field_update'">
                  </div>
                  <div>
                    <p class="text-sm text-text-primary">{{ formatAction(log.action) }}</p>
                    @if (log.old_value && log.new_value) {
                      <p class="text-xs text-text-muted">{{ log.old_value }} &rarr; {{ log.new_value }}</p>
                    } @else if (log.new_value) {
                      <p class="text-xs text-text-muted truncate max-w-[200px]">{{ log.new_value }}</p>
                    }
                    <p class="text-xs text-text-muted/60 mt-0.5">{{ log.performed_by }} · {{ log.created_at_human }}</p>
                  </div>
                </div>
              } @empty {
                <p class="text-sm text-text-muted">No activity yet</p>
              }
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="bg-red-500/10 rounded-2xl border border-red-500/20 p-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 class="text-sm font-semibold text-red-400">Danger Zone</h3>
            </div>
            <p class="text-xs text-text-muted mb-3">This will permanently delete this punch item.</p>
            <button (click)="deleteItem()" class="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">Delete Item</button>
          </div>

          </div><!-- /right column -->
        </div><!-- /grid -->
      }
    </div>
  `
})
/**
 * Detail view for a single punch item with inline field editing,
 * status transition buttons, resolution photo upload, activity log timeline,
 * and a danger zone for deletion.
 * Uses a two-column layout on desktop (3/5 left for content, 2/5 right for activity/danger).
 */
export class PunchItemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private punchItemService = inject(PunchItemService);
  private photoService = inject(PhotoService);
  private notificationService = inject(NotificationService);

  /** UUID of the parent project, extracted from route params. */
  projectId = '';
  /** UUID of this punch item, extracted from route params. */
  itemId = '';
  /** The currently loaded punch item data. */
  item = signal<PunchItem | null>(null);
  /** Whether the item is currently being fetched. */
  loading = signal(true);
  /** Controls visibility of the resolution photo upload widget. */
  showResolutionUpload = signal(false);

  /** Local copy of editable fields, synced on load and used for inline editing via blur/change events. */
  editData: any = {};

  trades = [
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'painting', label: 'Painting' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'concrete', label: 'Concrete' },
    { value: 'glazing', label: 'Glazing' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'fire_protection', label: 'Fire Protection' },
    { value: 'insulation', label: 'Insulation' },
    { value: 'general', label: 'General' },
  ];

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params['id'];
    this.itemId = this.route.snapshot.params['itemId'];
    this.loadItem();
  }

  /** Fetches the punch item from the API and populates the editable fields. */
  loadItem(): void {
    this.loading.set(true);
    this.punchItemService.getById(this.projectId, this.itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        this.editData = {
          description: item.description,
          location: item.location || '',
          assigned_to: item.assigned_to || '',
          trade: item.trade,
          severity: item.severity,
          suggested_action: item.suggested_action || '',
        };
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /**
   * Saves a single field if it has changed from the server-side value.
   * Called on blur (text inputs) or change (selects) events.
   * @param field - The field name to save (e.g. "description", "trade").
   */
  saveField(field: string): void {
    const currentItem = this.item();
    if (!currentItem) return;
    const currentValue = (currentItem as any)[field] || '';
    if (this.editData[field] === currentValue) return;

    this.punchItemService.update(this.projectId, this.itemId, { [field]: this.editData[field] }).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.notificationService.success('Updated successfully');
      }
    });
  }

  /**
   * Transitions the punch item to a new workflow status.
   * @param status - The target status key (e.g. "in_progress", "resolved").
   */
  updateStatus(status: string): void {
    this.punchItemService.updateStatus(this.projectId, this.itemId, status).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.notificationService.success(`Status updated to ${updated.status_label}`);
      }
    });
  }

  /**
   * Uploads a resolution photo for this punch item, then reloads the item data.
   * @param event - The photo data emitted by the PhotoUploadComponent.
   */
  onResolutionPhoto(event: { base64: string; mimeType: string; preview: string }): void {
    this.photoService.upload(this.itemId, event.base64, 'resolution').subscribe({
      next: () => {
        this.notificationService.success('Resolution photo uploaded');
        this.showResolutionUpload.set(false);
        this.loadItem();
      }
    });
  }

  /** Permanently deletes this punch item after a browser confirm prompt, then navigates back. */
  deleteItem(): void {
    if (!confirm('Are you sure you want to delete this item?')) return;
    this.punchItemService.delete(this.projectId, this.itemId).subscribe({
      next: () => {
        this.notificationService.success('Item deleted');
        this.goBack();
      }
    });
  }

  /** Navigates back to the punch list for this project. */
  goBack(): void {
    this.router.navigate(['/projects', this.projectId, 'punch-list']);
  }

  /**
   * Returns color-coded Tailwind CSS classes for a status transition button.
   * @param value - The target status key.
   * @returns A record mapping class strings to boolean (always true for the matched status).
   */
  getTransitionClasses(value: string): Record<string, boolean> {
    return {
      'border-orange-500/30 text-orange-400 bg-orange-500/10': value === 'in_progress',
      'border-green-500/30 text-green-400 bg-green-500/10': value === 'resolved',
      'border-teal-500/30 text-teal-400 bg-teal-500/10': value === 'verified',
      'border-red-500/30 text-red-400 bg-red-500/10': value === 'open',
    };
  }

  /**
   * Converts a snake_case action string to Title Case for display in the activity log.
   * @param action - The raw action string (e.g. "status_change").
   * @returns A human-readable title-cased string (e.g. "Status Change").
   */
  formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
