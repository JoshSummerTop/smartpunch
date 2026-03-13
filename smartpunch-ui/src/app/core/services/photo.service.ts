import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service for uploading photos (deficiency or resolution) to punch items.
 * Communicates with the `/photos/:punchItemId` API endpoint.
 */
@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);

  /**
   * Uploads a base64-encoded photo and associates it with a punch item.
   * @param punchItemId - The UUID of the punch item to attach the photo to.
   * @param base64Photo - The photo data encoded as a base64 string.
   * @param type - Whether this is a "deficiency" photo (initial) or a "resolution" photo.
   * @returns An observable emitting the stored file path and public URL.
   */
  upload(punchItemId: string, base64Photo: string, type: 'deficiency' | 'resolution'): Observable<{ path: string; url: string }> {
    return this.http.post<{ path: string; url: string }>(`/photos/${punchItemId}`, {
      photo: base64Photo,
      type
    });
  }
}
