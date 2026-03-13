<?php

namespace App\Services;

use App\Models\PunchItem;

/**
 * Generates sequential PLI-### item numbers within a project.
 *
 * Numbers are scoped per project and include soft-deleted items to avoid
 * reusing identifiers. Format: PLI-001, PLI-002, etc.
 */
class PunchItemNumberGenerator
{
    /**
     * Generate the next sequential item number for the given project.
     *
     * Queries all items (including soft-deleted) to find the highest existing
     * number, then increments by one. Returns zero-padded format PLI-###.
     *
     * @param string $projectId UUID of the project.
     * @return string Next item number (e.g., "PLI-004").
     */
    public function generate(string $projectId): string
    {
        $lastItem = PunchItem::where('project_id', $projectId)
            ->withTrashed()
            ->orderByRaw("CAST(SUBSTR(item_number, 5) AS INTEGER) DESC")
            ->first();

        if ($lastItem) {
            $lastNumber = (int) substr($lastItem->item_number, 4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return 'PLI-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
