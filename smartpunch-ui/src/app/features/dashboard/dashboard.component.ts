import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { Project, CreateProject } from '../../core/models/project.model';
import { DatePickerComponent } from '../../shared/components/date-picker.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent, ConfirmModalComponent],
  template: `
    <div class="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto bg-surface-base min-h-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-bold text-text-primary">Projects</h1>
          <p class="text-sm text-text-muted mt-1">Manage your construction punch lists</p>
        </div>
        <!-- Desktop: full button; Mobile: icon-only -->
        <button (click)="showCreateModal.set(true)"
                class="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
        <button (click)="showCreateModal.set(true)"
                class="md:hidden w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white transition-colors flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- Search with icon -->
      <div class="mb-5 relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search projects..."
               [ngModel]="searchTerm()"
               (ngModelChange)="onSearch($event)"
               class="w-full pl-11 pr-4 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary">
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }

      <!-- Project Cards -->
      @if (!loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-container">
          @for (project of projects(); track project.id; let i = $index) {
            <div (click)="goToProject(project)"
                 class="stagger-child bg-surface-card rounded-2xl border-2 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                 [ngClass]="getHealthBorderClass(project.completion_percentage)"
                 [style.animation-delay]="i * 50 + 'ms'">

              <div class="p-5">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="font-semibold text-text-primary text-sm leading-tight">{{ project.name }}</h3>
                  <div class="relative shrink-0">
                    <button (click)="toggleProjectMenu($event, project.id)"
                            class="w-7 h-7 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors flex items-center justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    @if (openMenuId() === project.id) {
                      <div class="fixed inset-0 z-40" (click)="closeMenu($event)"></div>
                      <div class="absolute right-0 top-8 z-50 w-44 bg-surface-card border border-border-default rounded-xl shadow-xl overflow-hidden animate-slide-up">
                        <button (click)="confirmDeleteProject($event, project)"
                                class="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Project
                        </button>
                      </div>
                    }
                  </div>
                </div>

                @if (project.address) {
                  <p class="text-xs text-text-secondary mb-1 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ project.address }}
                  </p>
                }
                @if (project.client_name) {
                  <p class="text-xs text-text-muted mb-3">{{ project.client_name }}</p>
                }

                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-text-muted">Completion</span>
                    <span class="font-semibold text-primary">{{ project.completion_percentage }}%</span>
                  </div>
                  <div class="w-full bg-surface-elevated rounded-full h-2.5">
                    <div class="h-2.5 rounded-full bg-primary transition-all duration-500"
                         [style.width.%]="project.completion_percentage">
                    </div>
                  </div>
                </div>

                <!-- Stats -->
                <div class="flex items-center gap-4 text-xs text-text-muted">
                  <span class="flex items-center gap-1">
                    <span class="font-semibold text-text-secondary">{{ project.punch_items_count }}</span> total
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <span class="font-semibold text-text-secondary">{{ project.open_items_count }}</span> open
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="font-semibold text-text-secondary">{{ project.resolved_items_count }}</span> resolved
                  </span>
                </div>

                @if (project.target_completion_date) {
                  <p class="text-xs text-text-muted mt-3 pt-3 border-t border-border-default">
                    Target: {{ project.target_completion_date }}
                  </p>
                }
              </div>
            </div>
          }
        </div>

        @if (projects().length === 0) {
          <div class="text-center py-20 text-text-muted">
            <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-card border border-border-default flex items-center justify-center">
              <svg class="h-10 w-10 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p class="text-base text-text-secondary font-medium mb-1">No projects yet</p>
            <p class="text-sm text-text-muted mb-6">Create a project to start capturing deficiencies</p>
            <button (click)="showCreateModal.set(true)"
                    class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              Create your first project
            </button>
          </div>
        }
      }

      <!-- Create Project Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
          <div class="flex min-h-screen items-end md:items-center justify-center p-0 md:p-4">
            <div class="fixed inset-0 bg-black/60" (click)="showCreateModal.set(false)"></div>
            <div class="relative bg-surface-card rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-lg p-6 animate-slide-in-bottom md:animate-slide-up">
              <h2 class="text-lg font-display font-bold text-text-primary mb-4">New Project</h2>
              <form (ngSubmit)="createProject()">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Project Name *</label>
                    <input type="text" [(ngModel)]="newProject.name" name="name" required
                           class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Address</label>
                    <input type="text" [(ngModel)]="newProject.address" name="address"
                           class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Client Name</label>
                    <input type="text" [(ngModel)]="newProject.client_name" name="client_name"
                           class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Target Completion Date</label>
                    <app-date-picker
                      [value]="newProject.target_completion_date"
                      placeholder="Select a date"
                      (dateChange)="newProject.target_completion_date = $event" />
                  </div>
                </div>
                <div class="flex gap-3 mt-6">
                  <button type="button" (click)="showCreateModal.set(false)"
                          class="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover">
                    Cancel
                  </button>
                  <button type="submit" [disabled]="!newProject.name"
                          class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50">
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteConfirm()"
        title="Delete Project"
        [message]="deleteMessage()"
        confirmText="Delete"
        (confirmed)="deleteProject()"
        (cancelled)="showDeleteConfirm.set(false)" />
    </div>
  `
})
/**
 * Dashboard component that displays the list of all construction projects.
 * Provides search filtering and a modal form for creating new projects.
 * Project cards are color-coded by completion health (green >70%, orange 30-70%, red <30%).
 */
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  /** Reactive list of projects displayed in the card grid. */
  projects = signal<Project[]>([]);
  /** Whether a project fetch is currently in progress. */
  loading = signal(true);
  /** Controls visibility of the "New Project" modal. */
  showCreateModal = signal(false);
  /** Current search input value, used to filter projects by name/address. */
  searchTerm = signal('');
  /** ID of the project whose ellipsis menu is currently open. */
  openMenuId = signal<string | null>(null);
  /** Controls visibility of the delete confirmation modal. */
  showDeleteConfirm = signal(false);
  /** The project currently targeted for deletion. */
  projectToDelete = signal<Project | null>(null);
  deleteMessage = computed(() => {
    const name = this.projectToDelete()?.name || '';
    return `This will permanently delete '${name}' and all its punch items. This cannot be undone.`;
  });

  /** Form data for the "create project" modal. */
  newProject: CreateProject = { name: '' };

  ngOnInit(): void {
    this.loadProjects();
  }

  /** Fetches projects from the API using the current search term. */
  loadProjects(): void {
    this.loading.set(true);
    this.projectService.getAll(this.searchTerm()).subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /**
   * Updates the search term and reloads the project list.
   * @param term - The new search string from the input field.
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.loadProjects();
  }

  /**
   * Navigates to the punch list view for the selected project.
   * @param project - The project to navigate to.
   */
  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id, 'punch-list']);
  }

  /**
   * Returns a Tailwind border color class based on the project's completion percentage.
   * @param pct - Completion percentage (0-100).
   * @returns A border color class string (green >70%, orange 30-70%, red <30%).
   */
  getHealthBorderClass(pct: number): string {
    if (pct > 70) return 'border-green-500/40';
    if (pct > 30) return 'border-orange-500/40';
    return 'border-red-500/40';
  }

  closeMenu(event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(null);
  }

  toggleProjectMenu(event: Event, projectId: string): void {
    event.stopPropagation();
    this.openMenuId.update(id => id === projectId ? null : projectId);
  }

  confirmDeleteProject(event: Event, project: Project): void {
    event.stopPropagation();
    this.openMenuId.set(null);
    this.projectToDelete.set(project);
    this.showDeleteConfirm.set(true);
  }

  deleteProject(): void {
    const project = this.projectToDelete();
    if (!project) return;
    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.notificationService.success('Project deleted');
        this.showDeleteConfirm.set(false);
        this.projectToDelete.set(null);
        this.loadProjects();
      }
    });
  }

  /** Submits the new project form to the API, then refreshes the project list on success. */
  createProject(): void {
    if (!this.newProject.name) return;
    this.projectService.create(this.newProject).subscribe({
      next: () => {
        this.notificationService.success('Project created successfully');
        this.showCreateModal.set(false);
        this.newProject = { name: '' };
        this.loadProjects();
      }
    });
  }
}
