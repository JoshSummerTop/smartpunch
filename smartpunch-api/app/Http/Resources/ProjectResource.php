<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * JSON API resource for Project models.
 *
 * Transforms a Project into a flat JSON object with computed counts
 * (punch_items_count, open_items_count, resolved_items_count) and a
 * calculated completion_percentage. Falls back to querying the database
 * if eager-loaded counts are not available.
 */
class ProjectResource extends JsonResource
{
    /**
     * Transform the project into an API-ready array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'client_name' => $this->client_name,
            'target_completion_date' => $this->target_completion_date?->toDateString(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'punch_items_count' => $this->punch_items_count ?? $this->punchItems()->count(),
            'open_items_count' => $this->open_items_count ?? $this->punchItems()->where('status', 'open')->count(),
            'resolved_items_count' => $this->resolved_items_count ?? $this->punchItems()->whereIn('status', ['resolved', 'verified'])->count(),
            'completion_percentage' => $this->when(
                isset($this->punch_items_count),
                function () {
                    $total = $this->punch_items_count ?? 0;
                    if ($total === 0) return 0;
                    $resolved = $this->resolved_items_count ?? 0;
                    return round(($resolved / $total) * 100, 1);
                },
                fn() => $this->completion_percentage
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
