import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService } from '../../core/services/ai.service';
import { PunchItemService } from '../../core/services/punch-item.service';
import { NotificationService } from '../../core/services/notification.service';
import { PhotoUploadComponent } from '../../shared/components/photo-upload.component';
import { CreatePunchItem } from '../../core/models/punch-item.model';

type Step = 'upload' | 'analyzing' | 'results';

@Component({
  selector: 'app-ai-capture-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PhotoUploadComponent],
  template: `
    <!-- Backdrop + modal shell: full-screen mobile, centered modal desktop -->
    <div class="fixed inset-0 z-50 flex items-end md:items-center md:justify-center animate-fade-in">
      <div class="fixed inset-0 bg-black/60 hidden md:block" (click)="close()"></div>
    <div class="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl md:border md:border-border-default md:shadow-2xl bg-surface-base flex flex-col animate-slide-in-bottom md:animate-slide-up overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border-default bg-surface-card shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary-surface flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">AI Capture</h2>
            <p class="text-[10px] text-text-muted">Photo-powered deficiency analysis</p>
          </div>
        </div>
        <button (click)="close()" class="w-9 h-9 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Step Indicator — numbered circles with labels -->
      <div class="flex items-center justify-between px-6 py-3 shrink-0">
        @for (s of steps; track s.key; let i = $index; let last = $last) {
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                 [class.bg-primary]="getStepIndex(step()) >= i"
                 [class.text-white]="getStepIndex(step()) >= i"
                 [class.bg-surface-elevated]="getStepIndex(step()) < i"
                 [class.text-text-muted]="getStepIndex(step()) < i">
              {{ i + 1 }}
            </div>
            <span class="text-xs font-medium hidden sm:inline"
                  [class.text-primary]="getStepIndex(step()) >= i"
                  [class.text-text-muted]="getStepIndex(step()) < i">
              {{ s.label }}
            </span>
          </div>
          @if (!last) {
            <div class="flex-1 h-px mx-2"
                 [style.background-color]="getStepIndex(step()) > i ? 'rgba(249,115,22,0.4)' : 'var(--color-surface-elevated)'">
            </div>
          }
        }
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto px-4 pb-6">
        <!-- Upload Step -->
        @if (step() === 'upload') {
          <div class="flex flex-col h-full">
            <!-- Massive camera area -->
            <div class="flex-1 min-h-[50vh] flex items-center justify-center mb-4">
              <div class="w-full">
                <app-photo-upload (photoSelected)="onPhotoSelected($event)" />
              </div>
            </div>

            <!-- Location -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-text-secondary mb-1">Location (optional)</label>
              <input type="text" [(ngModel)]="location" placeholder="e.g., Unit 4B - Kitchen"
                     class="w-full px-4 py-3 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary">
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button (click)="close()"
                      class="flex-1 px-4 py-3 text-sm font-medium text-text-secondary bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover">
                Cancel
              </button>
              <button (click)="analyze()" [disabled]="!photoBase64"
                      class="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze with AI
              </button>
            </div>
          </div>
        }

        <!-- Analyzing Step — Dramatic full-screen animation -->
        @if (step() === 'analyzing') {
          <div class="flex flex-col items-center justify-center min-h-[70vh]">
            <!-- Pulsing orange ring -->
            <div class="relative w-32 h-32 mb-8">
              <div class="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
              <div class="absolute inset-2 rounded-full border-2 border-primary/20 animate-pulse"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-20 h-20 rounded-full bg-primary-surface flex items-center justify-center">
                  <svg class="w-10 h-10 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <!-- Scanning line -->
              <div class="absolute inset-x-0 h-0.5 bg-primary/60 animate-bounce" style="top: 50%"></div>
            </div>

            <h3 class="text-lg font-semibold text-text-primary mb-2">AI is analyzing your photo</h3>

            <!-- Cycling text -->
            <div class="h-6 overflow-hidden">
              <div class="animate-analyzing-text">
                <p class="text-sm text-text-secondary h-6 flex items-center justify-center">Detecting deficiency...</p>
                <p class="text-sm text-text-secondary h-6 flex items-center justify-center">Assessing severity...</p>
                <p class="text-sm text-text-secondary h-6 flex items-center justify-center">Identifying trade...</p>
                <p class="text-sm text-text-secondary h-6 flex items-center justify-center">Generating action...</p>
              </div>
            </div>

            <div class="mt-8 flex justify-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        }

        <!-- Results Step -->
        @if (step() === 'results') {
          <div class="space-y-4 animate-slide-up">
            <!-- Photo large -->
            @if (photoPreview) {
              <img [src]="photoPreview" class="w-full rounded-2xl object-cover max-h-56" alt="Analyzed photo">
            }

            @if (aiError()) {
              <div class="bg-primary-surface border border-primary/20 rounded-xl p-4 text-sm text-primary-light">
                <p class="font-medium">AI analysis unavailable</p>
                <p class="text-xs mt-1 text-text-muted">{{ aiError() }} — Please fill in the details manually.</p>
              </div>
            }

            <!-- Editable dark cards -->
            <div class="bg-surface-card rounded-2xl border border-border-default p-4 space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <label class="text-sm font-medium text-text-secondary">Description *</label>
                  @if (!aiError() && resultItem.description) {
                    <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-surface text-primary">AI detected</span>
                  }
                </div>
                <textarea [(ngModel)]="resultItem.description" rows="3"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Trade *</label>
                  <select [(ngModel)]="resultItem.trade"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
                    <option value="">Select trade...</option>
                    @for (t of trades; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Severity *</label>
                  <select [(ngModel)]="resultItem.severity"
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
                <label class="block text-sm font-medium text-text-secondary mb-1">Location</label>
                <input type="text" [(ngModel)]="resultItem.location"
                       class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1">Suggested Action</label>
                <textarea [(ngModel)]="resultItem.suggested_action" rows="2"
                          class="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="step.set('upload')"
                      class="flex-1 px-4 py-3 text-sm font-medium text-text-secondary bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover">
                Back
              </button>
              <button (click)="saveItem()" [disabled]="!resultItem.description || !resultItem.trade || !resultItem.severity"
                      class="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50">
                Save to Punch List
              </button>
            </div>
          </div>
        }
      </div>
    </div>
    </div>
  `,
  styles: [`
    @keyframes analyzing-text {
      0%, 20% { transform: translateY(0); }
      25%, 45% { transform: translateY(-24px); }
      50%, 70% { transform: translateY(-48px); }
      75%, 95% { transform: translateY(-72px); }
      100% { transform: translateY(0); }
    }
    .animate-analyzing-text {
      animation: analyzing-text 6s ease-in-out infinite;
    }
  `]
})
/**
 * Three-step AI-powered deficiency capture modal.
 *
 * Step 1 ("upload"): User takes or selects a photo and optionally enters a location.
 * Step 2 ("analyzing"): Animated loading state while the AI endpoint processes the image.
 * Step 3 ("results"): Editable form pre-filled with AI-detected fields; user reviews and saves.
 *
 * Full-screen on mobile, centered `max-w-2xl` modal on desktop.
 */
export class AICaptureModalComponent {
  /** UUID of the project to create the punch item in. */
  @Input() projectId = '';
  /** Emitted when the modal is dismissed without saving. */
  @Output() closed = new EventEmitter<void>();
  /** Emitted after a punch item is successfully created from the AI results. */
  @Output() itemCreated = new EventEmitter<void>();

  private aiService = inject(AIService);
  private punchItemService = inject(PunchItemService);
  private notificationService = inject(NotificationService);

  /** Current wizard step in the 3-step flow. */
  step = signal<Step>('upload');
  /** Error message from the AI endpoint, displayed in the results step if analysis fails. */
  aiError = signal<string>('');

  /** Raw base64-encoded image data (without data URI prefix) for the selected photo. */
  photoBase64 = '';
  /** MIME type of the selected photo (e.g. "image/jpeg"). */
  photoMimeType = '';
  /** Full data URI string used for the image preview. */
  photoPreview = '';
  /** Optional user-entered location context passed to the AI endpoint. */
  location = '';

  resultItem: CreatePunchItem = { description: '', trade: '', severity: '' };

  steps = [
    { key: 'upload', label: 'Upload' },
    { key: 'analyzing', label: 'Analyze' },
    { key: 'results', label: 'Results' }
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

  /**
   * Returns the numeric index (0-2) of a step, used for progress indicator highlighting.
   * @param step - The step key to look up.
   * @returns The zero-based index in the steps array.
   */
  getStepIndex(step: Step): number {
    return this.steps.findIndex(s => s.key === step);
  }

  /**
   * Callback from the PhotoUploadComponent when a photo is selected.
   * Stores the base64 data, MIME type, and preview URI for later use.
   * @param event - The photo data emitted by the upload component.
   */
  onPhotoSelected(event: { base64: string; mimeType: string; preview: string }): void {
    this.photoBase64 = event.base64;
    this.photoMimeType = event.mimeType;
    this.photoPreview = event.preview;
  }

  /**
   * Sends the selected photo to the AI analysis endpoint.
   * On success, pre-fills the result form with AI-detected values.
   * On failure, sets the error message and presents an empty form for manual entry.
   */
  analyze(): void {
    if (!this.photoBase64) return;
    this.step.set('analyzing');
    this.aiError.set('');

    this.aiService.analyzeImage(this.photoBase64, this.photoMimeType, this.location || undefined).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.resultItem = {
            description: response.data.description,
            trade: response.data.trade,
            severity: response.data.severity,
            suggested_action: response.data.suggested_action,
            location: this.location,
            photo: this.photoBase64,
          };
        } else {
          this.aiError.set(response.message || 'Analysis failed');
          this.resultItem = { description: '', trade: '', severity: '', location: this.location, photo: this.photoBase64 };
        }
        this.step.set('results');
      },
      error: (err) => {
        this.aiError.set(err.error?.message || 'Unable to connect to AI service');
        this.resultItem = { description: '', trade: '', severity: '', location: this.location, photo: this.photoBase64 };
        this.step.set('results');
      }
    });
  }

  /** Saves the reviewed/edited punch item to the API and emits the `itemCreated` event on success. */
  saveItem(): void {
    if (!this.resultItem.description || !this.resultItem.trade || !this.resultItem.severity) return;

    this.punchItemService.create(this.projectId, this.resultItem).subscribe({
      next: () => {
        this.notificationService.success('Punch item created from AI analysis');
        this.itemCreated.emit();
      }
    });
  }

  /** Closes the modal by emitting the `closed` event. */
  close(): void {
    this.closed.emit();
  }
}
