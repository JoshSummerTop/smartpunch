<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * JSON API resource for PunchItem models.
 *
 * Transforms a PunchItem into a flat JSON object including enum labels,
 * allowed status transitions (from the state machine), generated photo
 * URLs, days_open, and conditionally loaded activity logs.
 */
class PunchItemResource extends JsonResource
{
    /**
     * Transform the punch item into an API-ready array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'item_number' => $this->item_number,
            'description' => $this->description,
            'location' => $this->location,
            'trade' => $this->trade?->value,
            'trade_label' => $this->trade?->label(),
            'severity' => $this->severity?->value,
            'severity_label' => $this->severity?->label(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'allowed_transitions' => collect($this->status?->allowedTransitions() ?? [])->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ])->toArray(),
            'assigned_to' => $this->assigned_to,
            'suggested_action' => $this->suggested_action,
            'photo_url' => $this->photo_path ? url("api/photos/{$this->id}/deficiency") : null,
            'resolution_photo_url' => $this->resolution_photo_path ? url("api/photos/{$this->id}/resolution") : null,
            'days_open' => $this->days_open,
            'activity_logs' => ActivityLogResource::collection($this->whenLoaded('activityLogs')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
