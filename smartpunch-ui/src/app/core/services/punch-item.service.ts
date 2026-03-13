import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PunchItem, CreatePunchItem } from '../models/punch-item.model';

/**
 * Query parameters for filtering and sorting punch items.
 */
export interface PunchItemFilters {
  /** Filter by trade key (e.g. "electrical"). */
  trade?: string;
  /** Filter by severity key (e.g. "critical"). */
  severity?: string;
  /** Filter by status key (e.g. "open"). */
  status?: string;
  /** Free-text search across description and location. */
  search?: string;
  /** Field name to sort by. */
  sort?: string;
  /** Sort direction: "asc" or "desc". */
  direction?: string;
}

/**
 * Service responsible for CRUD operations, status transitions, and
 * bulk actions on punch items within a project.
 * Communicates with the `/projects/:id/punch-items` API endpoints.
 */
@Injectable({ providedIn: 'root' })
export class PunchItemService {
  private http = inject(HttpClient);

  /**
   * Retrieves all punch items for a project, optionally filtered and sorted.
   * @param projectId - The parent project UUID.
   * @param filters - Optional filter/sort parameters.
   * @returns An observable emitting the array of matching punch items.
   */
  getAll(projectId: string, filters?: PunchItemFilters): Observable<PunchItem[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(key, value);
      });
    }
    return this.http.get<{ data: PunchItem[] }>(`/projects/${projectId}/punch-items`, { params }).pipe(
      map(res => res.data)
    );
  }

  /**
   * Retrieves a single punch item by its UUID.
   * @param projectId - The parent project UUID.
   * @param itemId - The punch item UUID.
   * @returns An observable emitting the punch item with its activity logs.
   */
  getById(projectId: string, itemId: string): Observable<PunchItem> {
    return this.http.get<{ data: PunchItem }>(`/projects/${projectId}/punch-items/${itemId}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Creates a new punch item within a project.
   * @param projectId - The parent project UUID.
   * @param item - The punch item data to create.
   * @returns An observable emitting the newly created punch item.
   */
  create(projectId: string, item: CreatePunchItem): Observable<PunchItem> {
    return this.http.post<{ data: PunchItem }>(`/projects/${projectId}/punch-items`, item).pipe(
      map(res => res.data)
    );
  }

  /**
   * Partially updates an existing punch item's fields.
   * @param projectId - The parent project UUID.
   * @param itemId - The punch item UUID.
   * @param data - An object containing only the fields to change.
   * @returns An observable emitting the updated punch item.
   */
  update(projectId: string, itemId: string, data: Partial<CreatePunchItem & { status: string }>): Observable<PunchItem> {
    return this.http.put<{ data: PunchItem }>(`/projects/${projectId}/punch-items/${itemId}`, data).pipe(
      map(res => res.data)
    );
  }

  /**
   * Permanently deletes a punch item.
   * @param projectId - The parent project UUID.
   * @param itemId - The punch item UUID to delete.
   * @returns An observable that completes on success.
   */
  delete(projectId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(`/projects/${projectId}/punch-items/${itemId}`);
  }

  /**
   * Transitions a punch item to a new status via the dedicated status endpoint.
   * The API enforces allowed transitions based on the item's current status.
   * @param projectId - The parent project UUID.
   * @param itemId - The punch item UUID.
   * @param status - The target status key (e.g. "resolved").
   * @returns An observable emitting the updated punch item.
   */
  updateStatus(projectId: string, itemId: string, status: string): Observable<PunchItem> {
    return this.http.put<{ data: PunchItem }>(`/projects/${projectId}/punch-items/${itemId}/status`, { status }).pipe(
      map(res => res.data)
    );
  }

  /**
   * Applies a status transition to multiple punch items at once.
   * @param projectId - The parent project UUID.
   * @param itemIds - Array of punch item UUIDs to update.
   * @param status - The target status key to apply to all items.
   * @returns An observable emitting the IDs that were updated and any that failed.
   */
  bulkStatus(projectId: string, itemIds: string[], status: string): Observable<{ updated: string[]; failed: any[] }> {
    return this.http.post<{ updated: string[]; failed: any[] }>(`/projects/${projectId}/punch-items/bulk-status`, {
      item_ids: itemIds,
      status
    });
  }
}
