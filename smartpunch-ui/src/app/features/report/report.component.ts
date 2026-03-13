import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto bg-surface-base min-h-full">
      <button (click)="goBack()" class="text-sm text-text-muted hover:text-primary flex items-center gap-1 mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Punch List
      </button>

      @if (project()) {
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl md:text-3xl font-display font-bold text-text-primary">Project Report</h1>
            <p class="text-sm text-text-muted mt-0.5">{{ project()!.name }}</p>
          </div>
          <div class="flex items-center gap-2">
            @if (!loading() && !report()) {
              <button (click)="generateReport()"
                      class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </button>
            }
            <a [href]="pdfUrl" target="_blank"
               class="w-10 h-10 rounded-xl bg-surface-card border border-border-default hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="bg-surface-card rounded-2xl border border-border-default p-12 text-center">
          <div class="relative mx-auto w-16 h-16 mb-4">
            <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <div class="relative w-16 h-16 rounded-full bg-primary-surface flex items-center justify-center">
              <svg class="w-6 h-6 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-text-secondary">Generating report...</p>
        </div>
      }

      @if (report()) {
        <div class="space-y-4 animate-slide-up">
          <!-- Stats Grid -->
          @if (projectData()) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div class="bg-surface-card rounded-2xl border-2 border-primary/30 p-4 text-center">
                <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-primary-surface flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div class="text-2xl font-bold text-primary">{{ projectData()!.total_items }}</div>
                <div class="text-xs text-text-muted uppercase mt-1">Total Items</div>
              </div>
              <div class="bg-surface-card rounded-2xl border-2 border-red-500/30 p-4 text-center">
                <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-2xl font-bold text-red-400">{{ projectData()!.open_count }}</div>
                <div class="text-xs text-text-muted uppercase mt-1">Open</div>
              </div>
              <div class="bg-surface-card rounded-2xl border-2 border-green-500/30 p-4 text-center">
                <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-2xl font-bold text-green-400">{{ projectData()!.resolved_count }}</div>
                <div class="text-xs text-text-muted uppercase mt-1">Resolved</div>
              </div>
              <div class="bg-surface-card rounded-2xl border-2 border-blue-500/30 p-4 text-center">
                <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="text-2xl font-bold text-blue-400">{{ projectData()!.completion_percentage }}%</div>
                <div class="text-xs text-text-muted uppercase mt-1">Complete</div>
              </div>
            </div>
          }

          <!-- Report Content -->
          <div class="bg-surface-card rounded-2xl border border-border-default p-5 md:p-8">
            <div class="prose prose-sm prose-invert max-w-none text-text-secondary leading-relaxed" [innerHTML]="formattedReport()"></div>
          </div>
        </div>
      }

      @if (!loading() && !report()) {
        <div class="bg-surface-card rounded-2xl border border-border-default p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated border border-border-default flex items-center justify-center">
            <svg class="h-8 w-8 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-sm text-text-secondary">Click "Generate" to create an AI-powered status report</p>
          <p class="text-xs text-text-muted mt-1">Or use the download button for a standard PDF export</p>
        </div>
      }
    </div>
  `
})
/**
 * Report page component for generating and displaying an AI-written
 * project status report. Shows summary stat cards and rendered markdown content.
 * Also provides a direct link to download the report as a PDF.
 */
export class ReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);
  private projectService = inject(ProjectService);

  /** UUID of the current project, extracted from route params. */
  projectId = '';
  /** The current project metadata. */
  project = signal<Project | null>(null);
  /** Raw markdown report string returned by the AI endpoint. */
  report = signal<string>('');
  /** Summary statistics (total_items, open_count, etc.) returned alongside the report. */
  projectData = signal<any>(null);
  /** Whether a report generation request is in flight. */
  loading = signal(false);
  /** Absolute URL for the PDF download endpoint. */
  pdfUrl = '';

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params['id'];
    this.pdfUrl = this.reportService.getPdfUrl(this.projectId);
    this.projectService.getById(this.projectId).subscribe(p => this.project.set(p));
  }

  /** Requests the AI-generated report from the API and stores the result. */
  generateReport(): void {
    this.loading.set(true);
    this.reportService.generate(this.projectId).subscribe({
      next: (data) => {
        this.report.set(data.report);
        this.projectData.set(data.project_data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /**
   * Converts the raw markdown report into styled HTML for rendering via [innerHTML].
   *
   * The regex chain processes the markdown string in order:
   * 1. `^# (.+)$`     - Converts H1 headings to styled `<h1>` elements
   * 2. `^## (.+)$`    - Converts H2 headings to styled `<h2>` elements
   * 3. `^### (.+)$`   - Converts H3 headings to styled `<h3>` elements
   * 4. `\*\*(.+?)\*\*` - Converts bold `**text**` to `<strong>` elements
   * 5. `^- (.+)$`     - Converts unordered list items to `<li>` elements
   * 6. `\n\n`         - Converts double newlines to paragraph breaks
   * 7. `\n`           - Converts remaining single newlines to `<br>` tags
   *
   * @returns The HTML string ready for rendering.
   */
  formattedReport(): string {
    return this.report()
      // H1: top-level section headings (e.g. "# Executive Summary")
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-primary mb-3">$1</h1>')
      // H2: sub-section headings (e.g. "## Status Breakdown")
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-text-primary mt-6 mb-2">$1</h2>')
      // H3: sub-sub-section headings
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium text-text-secondary mt-4 mb-1">$1</h3>')
      // Bold text: **text** -> <strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
      // Unordered list items: "- item" -> <li>
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-text-secondary">$1</li>')
      // Paragraph breaks: double newline -> closing/opening <p> tags
      .replace(/\n\n/g, '</p><p class="mb-3 text-text-secondary">')
      // Line breaks: remaining single newlines -> <br>
      .replace(/\n/g, '<br>');
  }

  /** Navigates back to the punch list for this project. */
  goBack(): void {
    this.router.navigate(['/projects', this.projectId, 'punch-list']);
  }
}
