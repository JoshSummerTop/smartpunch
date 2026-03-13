import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PunchItemService, PunchItemFilters } from '../../core/services/punch-item.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { PunchItem, CreatePunchItem } from '../../core/models/punch-item.model';
import { Project } from '../../core/models/project.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge.component';
import { AICaptureModalComponent } from '../ai-capture/ai-capture-modal.component';

@Component({
  selector: 'app-punch-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent, SeverityBadgeComponent, AICaptureModalComponent],
  template: `
    <div class="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto bg-surface-base min-h-full">
      <!-- Header -->
      <div class="mb-4">
        <button (click)="goBack()" class="text-sm text-text-muted hover:text-primary flex items-center gap-1 mb-2 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
        @if (project()) {
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl md:text-3xl font-display font-bold text-text-primary">{{ project()!.name }}</h1>
              <p class="text-sm text-text-muted mt-0.5">{{ project()!.address }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="showAddItem.set(true)"
                      class="w-9 h-9 rounded-xl bg-surface-card border border-border-default hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <a [routerLink]="['/projects', projectId, 'report']"
                 class="w-9 h-9 rounded-xl bg-surface-card border border-border-default hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
              <!-- More menu -->
              <div class="relative">
                <button (click)="showMoreMenu.set(!showMoreMenu())"
                        class="w-9 h-9 rounded-xl bg-surface-card border border-border-default hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center md:hidden">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <!-- Dropdown menu -->
                @if (showMoreMenu()) {
                  <div class="fixed inset-0 z-40" (click)="showMoreMenu.set(false)"></div>
                  <div class="absolute right-0 top-11 z-50 w-48 bg-surface-card border border-border-default rounded-xl shadow-xl overflow-hidden animate-slide-up">
                    <button (click)="showAddItem.set(true); showMoreMenu.set(false)"
                            class="w-full px-4 py-3 text-left text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors flex items-center gap-2.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Manually
                    </button>
                    <button (click)="showAICapture.set(true); showMoreMenu.set(false)"
                            class="w-full px-4 py-3 text-left text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors flex items-center gap-2.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      AI Capture
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Status Filter Chips — horizontal scroll -->
      <div class="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4 no-scrollbar">
        @for (s of statusFilters; track s.value) {
          <button (click)="setStatusFilter(s.value)"
                  class="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
                  [class.bg-primary]="filters.status === s.value"
                  [class.text-white]="filters.status === s.value"
                  [class.bg-surface-card]="filters.status !== s.value"
                  [class.text-text-secondary]="filters.status !== s.value"
                  [class.border]="filters.status !== s.value"
                  [class.border-border-default]="filters.status !== s.value">
            {{ s.label }}
          </button>
        }
      </div>

      <!-- Search with icon -->
      <div class="mb-3 relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search items..."
               [(ngModel)]="filters.search" (ngModelChange)="loadItems()"
               class="w-full pl-11 pr-4 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary">
      </div>

      <!-- More Filters (expandable) -->
      <div class="mb-4">
        <button (click)="showFilters.set(!showFilters())" class="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          More Filters
          @if (filters.trade || filters.severity) {
            <span class="w-2 h-2 rounded-full bg-primary"></span>
          }
        </button>
        @if (showFilters()) {
          <div class="flex gap-3 mt-2 animate-slide-up">
            <select [(ngModel)]="filters.trade" (ngModelChange)="loadItems()"
                    class="flex-1 px-3 py-2 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary">
              <option value="">All Trades</option>
              @for (t of trades; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
            <select [(ngModel)]="filters.severity" (ngModelChange)="loadItems()"
                    class="flex-1 px-3 py-2 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary">
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="cosmetic">Cosmetic</option>
            </select>
          </div>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }

      <!-- Items Cards -->
      @if (!loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 stagger-container">
          @for (item of items(); track item.id; let i = $index) {
            <div (click)="goToItem(item)"
                 class="stagger-child bg-surface-card rounded-2xl border border-border-default hover:border-border-strong hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                 [style.animation-delay]="i * 50 + 'ms'">

              <div class="p-4">
                <div class="flex items-start gap-3">
                  <!-- Photo thumb -->
                  @if (item.photo_url) {
                    <img [src]="item.photo_url" class="w-12 h-12 rounded-xl object-cover shrink-0" alt="">
                  }

                  <div class="flex-1 min-w-0">
                    <!-- Top row: item number + severity -->
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-mono text-xs text-text-muted">{{ item.item_number }}</span>
                      <app-severity-badge [severity]="item.severity" [label]="item.severity_label" />
                    </div>

                    <!-- Description -->
                    <p class="text-sm text-text-primary line-clamp-2 mb-2">{{ item.description }}</p>

                    <!-- Bottom: location, trade, status -->
                    <div class="flex flex-wrap items-center gap-2">
                      @if (item.location) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-elevated text-text-muted">
                          {{ item.location }}
                        </span>
                      }
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-elevated text-text-muted">
                        {{ item.trade_label }}
                      </span>
                      <app-status-badge [status]="item.status" [label]="item.status_label" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        @if (items().length === 0) {
          <div class="text-center py-16 text-text-muted">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-card border border-border-default flex items-center justify-center">
              <svg class="h-8 w-8 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="text-sm text-text-secondary">No punch items found</p>
            <p class="text-xs text-text-muted mt-1">Use the camera button to capture your first deficiency</p>
          </div>
        }
      }

      <!-- Add Item Modal -->
      @if (showAddItem()) {
        <div class="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
          <div class="flex min-h-screen items-end md:items-center justify-center p-0 md:p-4">
            <div class="fixed inset-0 bg-black/60" (click)="showAddItem.set(false)"></div>
            <div class="relative bg-surface-card rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-lg p-6 animate-slide-in-bottom md:animate-slide-up">
              <h2 class="text-lg font-display font-bold text-text-primary mb-4">Add Punch Item</h2>
              <form (ngSubmit)="createItem()">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Description *</label>
                    <textarea [(ngModel)]="newItem.description" name="description" required rows="3"
                              class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-text-secondary mb-1">Location</label>
                      <input type="text" [(ngModel)]="newItem.location" name="location"
                             class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-text-secondary mb-1">Assigned To</label>
                      <input type="text" [(ngModel)]="newItem.assigned_to" name="assigned_to"
                             class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-text-secondary mb-1">Trade *</label>
                      <select [(ngModel)]="newItem.trade" name="trade" required
                              class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                        <option value="">Select trade...</option>
                        @for (t of trades; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-text-secondary mb-1">Severity *</label>
                      <select [(ngModel)]="newItem.severity" name="severity" required
                              class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                        <option value="">Select severity...</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                        <option value="cosmetic">Cosmetic</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Suggested Action</label>
                    <textarea [(ngModel)]="newItem.suggested_action" name="suggested_action" rows="2"
                              class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
                  </div>
                </div>
                <div class="flex gap-3 mt-6">
                  <button type="button" (click)="showAddItem.set(false)"
                          class="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover">Cancel</button>
                  <button type="submit" [disabled]="!newItem.description || !newItem.trade || !newItem.severity"
                          class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50">Add Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- AI Capture Modal -->
      @if (showAICapture()) {
        <app-ai-capture-modal
          [projectId]="projectId"
          (closed)="showAICapture.set(false)"
          (itemCreated)="onItemCreated()" />
      }
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
/**
 * Punch list component that displays a filterable, searchable card grid
 * of punch items for a single project. Supports status filter chips,
 * trade/severity dropdowns, bulk status updates, manual item creation,
 * and AI-powered capture via a modal.
 */
export class PunchListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private punchItemService = inject(PunchItemService);
  private projectService = inject(ProjectService);
  private notificationService = inject(NotificationService);

  /** UUID of the current project, extracted from the route params. */
  projectId = '';
  /** The current project metadata. */
  project = signal<Project | null>(null);
  /** Reactive list of punch items displayed in the card grid. */
  items = signal<PunchItem[]>([]);
  /** Whether a fetch is currently in progress. */
  loading = signal(true);
  /** Controls visibility of the AI Capture modal. */
  showAICapture = signal(false);
  /** Controls visibility of the manual "Add Item" modal. */
  showAddItem = signal(false);
  /** Controls visibility of the mobile overflow/more menu dropdown. */
  showMoreMenu = signal(false);
  /** Controls visibility of the expanded trade/severity filter row. */
  showFilters = signal(false);

  /** Active filter/sort parameters applied to the item query. */
  filters: PunchItemFilters = {};
  /** Form data for the manual "Add Item" modal. */
  newItem: CreatePunchItem = { description: '', trade: '', severity: '' };

  statusFilters = [
    { value: '', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'verified', label: 'Verified' },
  ];

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
    this.projectService.getById(this.projectId).subscribe(p => this.project.set(p));
    this.loadItems();
  }

  /**
   * Sets the active status filter chip and reloads items.
   * @param status - Status key to filter by, or empty string for "All".
   */
  setStatusFilter(status: string): void {
    this.filters.status = status || undefined;
    this.loadItems();
  }

  /** Fetches punch items from the API using the current filters. */
  loadItems(): void {
    this.loading.set(true);
    this.punchItemService.getAll(this.projectId, this.filters).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /** Resets all filters to their defaults and reloads items. */
  clearFilters(): void {
    this.filters = {};
    this.loadItems();
  }

  /**
   * Navigates to the detail view for a punch item.
   * @param item - The punch item to view.
   */
  goToItem(item: PunchItem): void {
    this.router.navigate(['/projects', this.projectId, 'punch-list', item.id]);
  }

  /** Navigates back to the project dashboard. */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /** Submits the manual "Add Item" form to the API and refreshes the list on success. */
  createItem(): void {
    if (!this.newItem.description || !this.newItem.trade || !this.newItem.severity) return;
    this.punchItemService.create(this.projectId, this.newItem).subscribe({
      next: () => {
        this.notificationService.success('Punch item created');
        this.showAddItem.set(false);
        this.newItem = { description: '', trade: '', severity: '' };
        this.loadItems();
      }
    });
  }

  /** Callback invoked when the AI Capture modal successfully creates an item; refreshes both items and project stats. */
  onItemCreated(): void {
    this.showAICapture.set(false);
    this.loadItems();
    this.projectService.getById(this.projectId).subscribe(p => this.project.set(p));
  }
}
