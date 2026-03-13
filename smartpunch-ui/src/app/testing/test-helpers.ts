import { Project } from '../core/models/project.model';
import { PunchItem, ActivityLog, AIAnalysisResponse } from '../core/models/punch-item.model';

export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: 'test-project-id',
    name: 'Test Project',
    address: '123 Test St',
    client_name: 'Test Client',
    target_completion_date: '2026-06-01',
    status: 'in_progress',
    status_label: 'In Progress',
    punch_items_count: 10,
    open_items_count: 5,
    resolved_items_count: 3,
    completion_percentage: 30,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockPunchItem(overrides?: Partial<PunchItem>): PunchItem {
  return {
    id: 'test-item-id',
    project_id: 'test-project-id',
    item_number: 'PI-001',
    description: 'Cracked drywall in hallway',
    location: 'Hallway B, 2nd Floor',
    trade: 'drywall',
    trade_label: 'Drywall',
    severity: 'major',
    severity_label: 'Major',
    status: 'open',
    status_label: 'Open',
    allowed_transitions: [
      { value: 'in_progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
    ],
    assigned_to: 'John Doe',
    suggested_action: 'Patch and repaint the affected area',
    photo_url: 'https://example.com/photo.jpg',
    resolution_photo_url: null,
    days_open: 5,
    activity_logs: [],
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

export function createMockActivityLog(overrides?: Partial<ActivityLog>): ActivityLog {
  return {
    id: 'test-log-id',
    punch_item_id: 'test-item-id',
    action: 'status_changed',
    old_value: 'open',
    new_value: 'in_progress',
    performed_by: 'system',
    created_at: '2026-01-16T08:00:00Z',
    created_at_human: '1 day ago',
    ...overrides,
  };
}

export function createMockAIResponse(overrides?: Partial<AIAnalysisResponse>): AIAnalysisResponse {
  return {
    success: true,
    data: {
      description: 'Water damage on ceiling tile',
      trade: 'plumbing',
      severity: 'major',
      suggested_action: 'Replace ceiling tile and inspect for leaks above',
    },
    ...overrides,
  };
}
