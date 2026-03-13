import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service for generating AI-powered project status reports and
 * constructing PDF download URLs.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  /**
   * Requests the API to generate an AI-written markdown report for a project.
   * @param projectId - The project UUID to generate a report for.
   * @returns An observable emitting the markdown report string and raw project data.
   */
  generate(projectId: string): Observable<{ report: string; project_data: any }> {
    return this.http.get<{ report: string; project_data: any }>(`/projects/${projectId}/report`);
  }

  /**
   * Constructs the direct URL for downloading the PDF version of a project report.
   * @param projectId - The project UUID.
   * @returns The absolute URL string for the PDF endpoint.
   */
  getPdfUrl(projectId: string): string {
    return `${environment.apiUrl}/projects/${projectId}/report/pdf`;
  }
}
