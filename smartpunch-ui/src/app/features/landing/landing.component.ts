import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-surface-base">
      <!-- Landing Header -->
      <header class="flex items-center justify-between px-6 md:px-10 py-4 relative z-10">
        <div class="flex items-center gap-2.5">
          <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span class="text-text-primary text-lg font-display font-bold tracking-tight">SmartPunch</span>
        </div>
        <a routerLink="/dashboard" class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          Go to Dashboard &rarr;
        </a>
      </header>

      <!-- Hero Section -->
      <section class="relative overflow-hidden px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-32">
        <!-- Background effects -->
        <div class="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-base to-transparent"></div>

        <div class="relative max-w-4xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-surface border border-primary/20 text-primary text-xs font-medium mb-8">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by AI
          </div>

          <h1 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
            AI-Powered<br>
            <span class="text-primary">Punch List</span><br>
            Management
          </h1>

          <p class="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap a photo of any construction deficiency. AI identifies the issue, classifies severity, and suggests remediation — in seconds.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/dashboard"
               class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg">
              Get Started
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a href="#how-it-works"
               class="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary px-6 py-3.5 rounded-xl text-sm font-medium transition-colors border border-border-default hover:border-border-strong">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section id="how-it-works" class="px-6 md:px-10 py-16 md:py-24 relative">
        <div class="max-w-5xl mx-auto">
          <h2 class="font-display text-2xl md:text-3xl font-bold text-text-primary text-center mb-4">How It Works</h2>
          <p class="text-text-secondary text-center mb-12 md:mb-16 max-w-lg mx-auto">Four simple steps from deficiency to resolution</p>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            <!-- Step 1 -->
            <div class="relative text-center group">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-card border border-border-default flex items-center justify-center group-hover:border-border-strong group-hover:shadow-lg transition-all">
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="font-display text-xs text-primary mb-2">01</div>
              <h3 class="text-sm font-semibold text-text-primary mb-1">Create Project</h3>
              <p class="text-xs text-text-muted">Set up your construction project with basic details</p>
              <!-- Connector line (desktop only) -->
              <div class="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border-default to-border-default/0"></div>
            </div>

            <!-- Step 2 -->
            <div class="relative text-center group">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-card border border-border-default flex items-center justify-center group-hover:border-border-strong group-hover:shadow-lg transition-all">
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="font-display text-xs text-primary mb-2">02</div>
              <h3 class="text-sm font-semibold text-text-primary mb-1">Capture Deficiency</h3>
              <p class="text-xs text-text-muted">Snap a photo of the issue on site</p>
              <div class="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border-default to-border-default/0"></div>
            </div>

            <!-- Step 3 -->
            <div class="relative text-center group">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-card border border-border-default flex items-center justify-center group-hover:border-border-strong group-hover:shadow-lg transition-all">
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="font-display text-xs text-primary mb-2">03</div>
              <h3 class="text-sm font-semibold text-text-primary mb-1">AI Analyzes</h3>
              <p class="text-xs text-text-muted">AI identifies trade, severity, and suggests action</p>
              <div class="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border-default to-border-default/0"></div>
            </div>

            <!-- Step 4 -->
            <div class="relative text-center group">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-card border border-border-default flex items-center justify-center group-hover:border-border-strong group-hover:shadow-lg transition-all">
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="font-display text-xs text-primary mb-2">04</div>
              <h3 class="text-sm font-semibold text-text-primary mb-1">Track & Resolve</h3>
              <p class="text-xs text-text-muted">Manage items through resolution with full audit trail</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="px-6 md:px-10 py-16 md:py-24 relative">
        <div class="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div class="relative max-w-5xl mx-auto">
          <h2 class="font-display text-2xl md:text-3xl font-bold text-text-primary text-center mb-4">Built for Construction</h2>
          <p class="text-text-secondary text-center mb-12 max-w-lg mx-auto">Every feature designed for field teams and project managers</p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <div class="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border-default p-5 hover:border-border-strong hover:shadow-lg transition-all">
              <div class="w-10 h-10 rounded-xl bg-primary-surface flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-text-primary mb-1.5">AI Photo Analysis</h3>
              <p class="text-xs text-text-muted leading-relaxed">Upload a photo and AI auto-classifies the deficiency type, trade, and severity.</p>
            </div>

            <div class="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border-default p-5 hover:border-border-strong hover:shadow-lg transition-all">
              <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-text-primary mb-1.5">Status Workflow</h3>
              <p class="text-xs text-text-muted leading-relaxed">Track items from Open to In Progress, Resolved, and Verified with full audit logging.</p>
            </div>

            <div class="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border-default p-5 hover:border-border-strong hover:shadow-lg transition-all">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-text-primary mb-1.5">AI Reports</h3>
              <p class="text-xs text-text-muted leading-relaxed">Generate AI-powered project status reports and export to PDF for stakeholders.</p>
            </div>

            <div class="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border-default p-5 hover:border-border-strong hover:shadow-lg transition-all">
              <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-text-primary mb-1.5">Severity Classification</h3>
              <p class="text-xs text-text-muted leading-relaxed">Critical, Major, Minor, Cosmetic — categorize issues by impact with color-coded indicators.</p>
            </div>

            <div class="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border-default p-5 hover:border-border-strong hover:shadow-lg transition-all">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-text-primary mb-1.5">Trade Tracking</h3>
              <p class="text-xs text-text-muted leading-relaxed">14 construction trades supported — filter and assign work by specialty.</p>
            </div>

            <div class="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border-default p-5 hover:border-border-strong hover:shadow-lg transition-all">
              <div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-text-primary mb-1.5">Photo Documentation</h3>
              <p class="text-xs text-text-muted leading-relaxed">Capture deficiency and resolution photos for complete visual documentation.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="px-6 md:px-10 py-16 md:py-24 relative">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="font-display text-2xl md:text-3xl font-bold text-text-primary mb-4">Ready to streamline your punch lists?</h2>
          <p class="text-text-secondary mb-8">Start capturing deficiencies with AI-powered analysis today.</p>
          <a routerLink="/dashboard"
             class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg">
            Get Started Free
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="px-6 md:px-10 py-8 border-t border-border-default">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="text-sm font-display font-bold text-text-secondary">SmartPunch</span>
          </div>
          <span class="text-xs text-text-muted">v1.0 — AI-Powered Construction Punch Lists</span>
        </div>
      </footer>
    </div>
  `
})
/**
 * Marketing landing page component.
 * Renders a standalone page (outside the app shell) with a hero section,
 * a 4-step "How It Works" timeline, a 6-card feature grid, and a bottom CTA.
 * Uses its own header with a link to the dashboard.
 */
export class LandingComponent {}
