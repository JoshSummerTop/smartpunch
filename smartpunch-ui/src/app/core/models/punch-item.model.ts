/**
 * Represents a single punch item (deficiency) within a project.
 * Includes status workflow data, photo URLs, and the full activity log.
 */
export interface PunchItem {
  /** Unique UUID identifier. */
  id: string;
  /** UUID of the parent project. */
  project_id: string;
  /** Sequential, human-readable item number (e.g. "PI-001"). */
  item_number: string;
  /** Free-text description of the deficiency. */
  description: string;
  /** Physical location within the project site; null if not specified. */
  location: string | null;
  /** Machine-readable trade key (e.g. "electrical", "plumbing"). */
  trade: string;
  /** Human-readable trade label. */
  trade_label: string;
  /** Machine-readable severity key (e.g. "critical", "minor"). */
  severity: string;
  /** Human-readable severity label. */
  severity_label: string;
  /** Current workflow status key (e.g. "open", "in_progress", "resolved", "verified"). */
  status: string;
  /** Human-readable status label. */
  status_label: string;
  /** Valid status transitions from the current status. */
  allowed_transitions: StatusTransition[];
  /** Person responsible for resolving this item; null if unassigned. */
  assigned_to: string | null;
  /** AI-generated or manual remediation suggestion; null if none. */
  suggested_action: string | null;
  /** URL to the original deficiency photo; null if no photo was uploaded. */
  photo_url: string | null;
  /** URL to the resolution photo; null until a resolution photo is uploaded. */
  resolution_photo_url: string | null;
  /** Number of days since this item was created. */
  days_open: number;
  /** Chronological audit trail of all changes to this item. */
  activity_logs: ActivityLog[];
  /** ISO-8601 timestamp of creation. */
  created_at: string;
  /** ISO-8601 timestamp of last update. */
  updated_at: string;
}

/**
 * Describes a valid status transition that can be applied to a punch item.
 */
export interface StatusTransition {
  /** Machine-readable target status (e.g. "in_progress"). */
  value: string;
  /** Human-readable transition label (e.g. "In Progress"). */
  label: string;
}

/**
 * A single entry in a punch item's audit trail.
 * Created automatically by the API observer whenever a field changes.
 */
export interface ActivityLog {
  /** Unique UUID identifier for this log entry. */
  id: string;
  /** UUID of the punch item this log belongs to. */
  punch_item_id: string;
  /** Type of action recorded (e.g. "status_change", "field_update", "created"). */
  action: string;
  /** Previous value before the change; null for creation events. */
  old_value: string | null;
  /** New value after the change; null if not applicable. */
  new_value: string | null;
  /** Identifier of who performed the action. */
  performed_by: string;
  /** ISO-8601 timestamp of when the action occurred. */
  created_at: string;
  /** Human-friendly relative time string (e.g. "2 hours ago"). */
  created_at_human: string;
}

/**
 * Response envelope from the AI image analysis endpoint.
 * On success, `data` contains the AI-detected fields; on failure, `message` explains the error.
 */
export interface AIAnalysisResponse {
  /** Whether the AI analysis completed successfully. */
  success: boolean;
  /** AI-detected punch item fields, present only when `success` is true. */
  data?: {
    /** AI-generated description of the deficiency. */
    description: string;
    /** Detected construction trade key. */
    trade: string;
    /** Assessed severity key. */
    severity: string;
    /** Recommended remediation action. */
    suggested_action: string;
  };
  /** Error or informational message; present when `success` is false. */
  message?: string;
}

/**
 * Payload for creating a new punch item.
 * `description`, `trade`, and `severity` are required.
 */
export interface CreatePunchItem {
  /** Required description of the deficiency. */
  description: string;
  /** Optional physical location within the project site. */
  location?: string;
  /** Required trade key (e.g. "electrical"). */
  trade: string;
  /** Required severity key (e.g. "critical"). */
  severity: string;
  /** Optional assignee name. */
  assigned_to?: string;
  /** Optional suggested remediation action. */
  suggested_action?: string;
  /** Optional base64-encoded photo data. */
  photo?: string;
}
