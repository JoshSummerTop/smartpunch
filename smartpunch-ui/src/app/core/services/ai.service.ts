import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AIAnalysisResponse } from '../models/punch-item.model';

/**
 * Service for AI-powered image analysis of construction deficiencies.
 * Sends a photo to the `/ai/analyze` endpoint and returns detected
 * trade, severity, description, and suggested action.
 */
@Injectable({ providedIn: 'root' })
export class AIService {
  private http = inject(HttpClient);

  /**
   * Sends a base64-encoded image to the AI analysis endpoint.
   * @param base64Image - The image data encoded as a base64 string (without the data URI prefix).
   * @param mimeType - The MIME type of the image (e.g. "image/jpeg", "image/png").
   * @param location - Optional location context to improve AI accuracy.
   * @returns An observable emitting the AI analysis response.
   */
  analyzeImage(base64Image: string, mimeType: string, location?: string): Observable<AIAnalysisResponse> {
    return this.http.post<AIAnalysisResponse>('/ai/analyze', {
      image: base64Image,
      mime_type: mimeType,
      location
    });
  }
}
