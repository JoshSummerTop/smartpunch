import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { NotificationService } from './core/services/notification.service';
import { AICaptureModalComponent } from './features/ai-capture/ai-capture-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AICaptureModalComponent],
  template: `
    <div class="flex flex-col h-screen bg-surface-base">

      <!-- ===== TOP HEADER — hidden on landing page ===== -->
      @if (!isLandingPage()) {
        <header class="h-14 md:h-16 bg-surface-glass backdrop-blur-xl border-b border-border-default flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-30">
          <a routerLink="/" class="flex items-center gap-2.5">
            <svg class="w-6 h-6 md:w-7 md:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="text-text-primary text-base md:text-lg font-display font-bold tracking-tight">SmartPunch</span>
          </a>

          <!-- Desktop nav — hidden on mobile -->
          <div class="hidden md:flex items-center gap-2">
            <a routerLink="/dashboard" routerLinkActive="bg-primary-surface text-primary" [routerLinkActiveOptions]="{exact: true}"
               class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg px-3 py-1.5">
              Projects
            </a>
            @if (activeProjectId()) {
              <a [routerLink]="['/projects', activeProjectId(), 'punch-list']" routerLinkActive="bg-primary-surface text-primary"
                 class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg px-3 py-1.5">
                Punch List
              </a>
              <a [routerLink]="['/projects', activeProjectId(), 'report']" routerLinkActive="bg-primary-surface text-primary"
                 class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg px-3 py-1.5">
                Report
              </a>
            }
            @if (activeProjectId()) {
              <button (click)="openAICapture()"
                      class="ml-2 bg-primary hover:bg-primary-hover text-white pl-3 pr-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                AI Capture
              </button>
            }
          </div>

        </header>
      }

      <!-- ===== MAIN CONTENT ===== -->
      <main class="flex-1 overflow-auto" [ngClass]="isLandingPage() ? '' : 'pb-20 md:pb-0'">
        <router-outlet />
      </main>

      <!-- ===== MOBILE BOTTOM NAV — hidden on md+ and landing page ===== -->
      @if (!isLandingPage()) {
        <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-glass backdrop-blur-xl border-t border-border-default flex items-center z-40"
             style="padding-bottom: env(safe-area-inset-bottom)">

          @if (activeProjectId()) {
            <!-- Inside a project: List + FAB + Report -->
            <a [routerLink]="['/projects', activeProjectId(), 'punch-list']"
               class="flex-1 flex flex-col items-center gap-1 py-2 transition-colors"
               [class.text-primary]="isOnPunchList()"
               [class.text-text-muted]="!isOnPunchList()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span class="text-[10px] font-medium">List</span>
            </a>

            <button (click)="openAICapture()"
                    class="relative -mt-8 w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors shadow-lg">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <a [routerLink]="['/projects', activeProjectId(), 'report']"
               class="flex-1 flex flex-col items-center gap-1 py-2 transition-colors"
               [class.text-primary]="isOnReport()"
               [class.text-text-muted]="!isOnReport()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-[10px] font-medium">Report</span>
            </a>
          } @else {
            <!-- Dashboard (no project): Only Projects tab, centered -->
            <div class="flex-1 flex justify-center">
              <a routerLink="/dashboard"
                 class="flex flex-col items-center gap-1 py-2 text-primary">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="text-[10px] font-medium">Projects</span>
              </a>
            </div>
          }
        </nav>
      }

      <!-- AI Capture Modal -->
      @if (showAICapture()) {
        <app-ai-capture-modal
          [projectId]="activeProjectId()"
          (closed)="showAICapture.set(false)"
          (itemCreated)="onAICaptureComplete()" />
      }

      <!-- Notifications -->
      <div class="fixed bottom-20 md:bottom-6 md:right-6 left-4 right-4 md:left-auto md:w-96 z-50 flex flex-col gap-2">
        @for (notification of notificationService.notifications(); track notification.id) {
          <div
            class="px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center justify-between gap-3 animate-slide-up"
            [class.bg-green-600]="notification.type === 'success'"
            [class.bg-red-600]="notification.type === 'error'"
            [class.bg-blue-600]="notification.type === 'info'"
            [class.bg-primary]="notification.type === 'warning'"
            [class.text-white]="true"
          >
            <span>{{ notification.message }}</span>
            <button (click)="notificationService.remove(notification.id)" class="text-white/80 hover:text-white shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
/**
 * Root application component providing the app shell layout:
 * - Glassmorphism top header with navigation (hidden on the landing page)
 * - Mobile bottom navigation bar with contextual tabs (hidden on desktop and landing page)
 * - Global AI Capture modal triggered from header or FAB
 * - Toast notification overlay positioned above the bottom nav
 *
 * Subscribes to router NavigationEnd events to extract the active project ID
 * from the URL and toggle landing-page mode.
 */
export class AppComponent implements OnInit, OnDestroy {
  /** Public reference to the notification service, used by the template to render toasts. */
  notificationService = inject(NotificationService);
  private router = inject(Router);
  /** Subscription to router events; cleaned up in ngOnDestroy. */
  private routerSub!: Subscription;

  /** Controls visibility of the global AI Capture modal. */
  showAICapture = signal(false);
  /** UUID of the currently active project, extracted from the URL; empty when not inside a project. */
  activeProjectId = signal('');
  /** Whether the current route is the landing page ("/"), which hides the app shell nav. */
  isLandingPage = signal(false);
  /** Cached current URL string for use by navigation helper methods. */
  private currentUrl = '';

  /** Initializes URL-based state and subscribes to future navigation events. */
  ngOnInit(): void {
    // Set initial state from current URL
    this.updateFromUrl(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        const event = e as NavigationEnd;
        this.updateFromUrl(event.urlAfterRedirects);
      });
  }

  /**
   * Parses a URL to extract the active project ID and determine if it is the landing page.
   *
   * URL parsing logic:
   * - Uses a regex `/projects/([^/]+)` to capture the project UUID segment from project routes.
   *   If the URL does not contain a `/projects/` segment, `activeProjectId` is set to empty string,
   *   which hides project-specific nav items (punch list link, report link, AI Capture button).
   * - Checks for exact match on "/" or "" to toggle `isLandingPage`, which hides the entire app shell
   *   header and bottom nav so the landing page renders with its own standalone header.
   *
   * @param url - The current router URL string (e.g. "/projects/abc-123/punch-list").
   */
  private updateFromUrl(url: string): void {
    this.currentUrl = url;
    // Extract the project UUID from URLs like "/projects/<uuid>/punch-list" or "/projects/<uuid>/report"
    const match = this.currentUrl.match(/\/projects\/([^/]+)/);
    this.activeProjectId.set(match ? match[1] : '');
    // The landing page has its own header, so hide the app shell when on "/" or ""
    this.isLandingPage.set(this.currentUrl === '/' || this.currentUrl === '');
  }

  /** Unsubscribes from router events to prevent memory leaks. */
  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  /**
   * Checks if the current route is a punch list page (used for mobile bottom nav active state).
   * @returns True if the URL contains "/punch-list".
   */
  isOnPunchList(): boolean {
    return this.currentUrl.includes('/punch-list');
  }

  /**
   * Checks if the current route is a report page (used for mobile bottom nav active state).
   * @returns True if the URL contains "/report".
   */
  isOnReport(): boolean {
    return this.currentUrl.includes('/report');
  }

  /** Opens the AI Capture modal if a project is currently active. */
  openAICapture(): void {
    if (this.activeProjectId()) {
      this.showAICapture.set(true);
    }
  }

  /**
   * Callback after the AI Capture modal successfully creates an item.
   * Closes the modal and force-reloads the current route to refresh data.
   */
  onAICaptureComplete(): void {
    this.showAICapture.set(false);
    const url = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url);
    });
  }
}
