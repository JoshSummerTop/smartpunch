import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (preview()) {
      <div class="relative">
        <img [src]="preview()" class="w-full rounded-xl object-cover" alt="Preview">
        <button (click)="clearPreview()" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-base/80 text-text-primary flex items-center justify-center hover:bg-surface-base">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    } @else {
      <!-- Mobile: Two large buttons -->
      <div class="flex flex-col gap-3 md:hidden">
        <button (click)="cameraInput.click()" type="button"
                class="flex items-center justify-center gap-3 w-full py-5 rounded-xl border-2 border-border-default bg-surface-elevated text-text-primary hover:border-primary hover:bg-primary-surface transition-colors">
          <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-base font-semibold">Camera</span>
        </button>
        <button (click)="galleryInput.click()" type="button"
                class="flex items-center justify-center gap-3 w-full py-5 rounded-xl border-2 border-border-default bg-surface-elevated text-text-primary hover:border-primary hover:bg-primary-surface transition-colors">
          <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-base font-semibold">Gallery</span>
        </button>
      </div>

      <!-- Desktop: Drag-and-drop zone -->
      <div class="hidden md:block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
           [class.border-primary]="isDragging()"
           [class.bg-primary-surface]="isDragging()"
           [class.border-border-default]="!isDragging()"
           [class.hover:border-primary]="!isDragging()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="galleryInput.click()">
        <svg class="mx-auto h-12 w-12 text-text-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="mt-3 text-sm text-text-secondary">
          <span class="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-text-muted mt-1">PNG, JPG, WebP up to 10MB</p>
      </div>

      <input #cameraInput type="file" class="hidden" accept="image/jpeg,image/png,image/webp" capture="environment" (change)="onFileSelected($event)">
      <input #galleryInput type="file" class="hidden" accept="image/jpeg,image/png,image/webp" (change)="onFileSelected($event)">
    }
  `
})
/**
 * Responsive photo upload component.
 * On mobile (< md), shows two large buttons for Camera and Gallery access.
 * On desktop (md+), shows a drag-and-drop zone with click-to-browse.
 * Validates file type (image/*) and size (max 10 MB), then emits the
 * base64 data, MIME type, and data-URI preview.
 */
export class PhotoUploadComponent {
  /** Emitted when a valid photo is selected, containing its base64 data, MIME type, and preview URL. */
  @Output() photoSelected = new EventEmitter<{ base64: string; mimeType: string; preview: string }>();

  /** Whether a file is currently being dragged over the drop zone. */
  isDragging = signal(false);
  /** Data URI of the currently selected image, used for the preview thumbnail. */
  preview = signal<string | null>(null);

  /** Clears the current photo preview, returning to the upload UI. */
  clearPreview(): void {
    this.preview.set(null);
  }

  /**
   * Handles dragover events on the drop zone.
   * @param event - The drag event to prevent default behavior on.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  /**
   * Handles dragleave events, resetting the drag visual state.
   * @param event - The drag event.
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  /**
   * Handles file drop events; extracts the first file and processes it.
   * @param event - The drop event containing the transferred files.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  /**
   * Handles the file input change event from camera or gallery inputs.
   * @param event - The native input change event.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFile(input.files[0]);
    }
  }

  /**
   * Validates and reads a file using FileReader, then emits the result.
   * Silently rejects non-image files and files exceeding 10 MB.
   * @param file - The File object to process.
   */
  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      this.preview.set(result);
      this.photoSelected.emit({
        base64,
        mimeType: file.type,
        preview: result
      });
    };
    reader.readAsDataURL(file);
  }
}
