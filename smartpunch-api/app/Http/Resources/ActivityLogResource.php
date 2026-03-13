<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * JSON API resource for ActivityLog models.
 *
 * Transforms an ActivityLog entry into a flat JSON object with both an
 * ISO 8601 timestamp and a human-readable relative date (e.g., "2 hours ago").
 */
class ActivityLogResource extends JsonResource
{
    /**
     * Transform the activity log entry into an API-ready array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'punch_item_id' => $this->punch_item_id,
            'action' => $this->action,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
            'performed_by' => $this->performed_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_human' => $this->created_at?->diffForHumans(),
        ];
    }
}
