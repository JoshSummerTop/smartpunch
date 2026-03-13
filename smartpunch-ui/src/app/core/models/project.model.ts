/**
 * Represents a construction project returned by the API.
 * Contains summary statistics for its punch items.
 */
export interface Project {
  /** Unique UUID identifier for the project. */
  id: string;
  /** Human-readable project name. */
  name: string;
  /** Street address or site location; null if not provided. */
  address: string | null;
  /** Name of the client or owner; null if not provided. */
  client_name: string | null;
  /** ISO-8601 date string (YYYY-MM-DD) for the target completion; null if unset. */
  target_completion_date: string | null;
  /** Machine-readable project status value (e.g. "active"). */
  status: string;
  /** Human-readable label for the project status. */
  status_label: string;
  /** Total number of punch items in this project. */
  punch_items_count: number;
  /** Number of punch items that are still open. */
  open_items_count: number;
  /** Number of punch items that have been resolved or verified. */
  resolved_items_count: number;
  /** Percentage of items completed (0-100). */
  completion_percentage: number;
  /** ISO-8601 timestamp of when the project was created. */
  created_at: string;
  /** ISO-8601 timestamp of the last project update. */
  updated_at: string;
}

/**
 * Payload for creating a new project.
 * Only `name` is required; all other fields are optional.
 */
export interface CreateProject {
  /** Required project name. */
  name: string;
  /** Optional street address or site location. */
  address?: string;
  /** Optional client or owner name. */
  client_name?: string;
  /** Optional target completion date (YYYY-MM-DD). */
  target_completion_date?: string;
  /** Optional initial status override. */
  status?: string;
}
