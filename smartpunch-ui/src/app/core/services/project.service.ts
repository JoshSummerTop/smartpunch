import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, CreateProject } from '../models/project.model';

/**
 * Service responsible for CRUD operations on construction projects.
 * Communicates with the `/projects` API endpoints via HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  /**
   * Retrieves all projects, optionally filtered by search term and status.
   * @param search - Optional text to filter projects by name or address.
   * @param status - Optional status key to filter by (e.g. "active").
   * @returns An observable emitting the array of matching projects.
   */
  getAll(search?: string, status?: string): Observable<Project[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<{ data: Project[] }>('/projects', { params }).pipe(
      map(res => res.data)
    );
  }

  /**
   * Retrieves a single project by its UUID.
   * @param id - The project UUID.
   * @returns An observable emitting the project.
   */
  getById(id: string): Observable<Project> {
    return this.http.get<{ data: Project }>(`/projects/${id}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Creates a new project.
   * @param project - The project data to create.
   * @returns An observable emitting the newly created project.
   */
  create(project: CreateProject): Observable<Project> {
    return this.http.post<{ data: Project }>('/projects', project).pipe(
      map(res => res.data)
    );
  }

  /**
   * Partially updates an existing project.
   * @param id - The project UUID to update.
   * @param project - An object containing only the fields to change.
   * @returns An observable emitting the updated project.
   */
  update(id: string, project: Partial<CreateProject>): Observable<Project> {
    return this.http.put<{ data: Project }>(`/projects/${id}`, project).pipe(
      map(res => res.data)
    );
  }

  /**
   * Permanently deletes a project and all its punch items.
   * @param id - The project UUID to delete.
   * @returns An observable that completes on success.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/projects/${id}`);
  }
}
