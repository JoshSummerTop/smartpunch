<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\PunchItem;

/**
 * Observer that auto-logs changes to punch items via ActivityLog.
 *
 * Listens for Eloquent created/updated events and writes audit trail entries
 * for a defined set of tracked fields.
 */
class PunchItemObserver
{
    /**
     * Log the creation of a new punch item.
     *
     * @param PunchItem $punchItem The newly created punch item.
     * @return void
     */
    public function created(PunchItem $punchItem): void
    {
        ActivityLog::create([
            'punch_item_id' => $punchItem->id,
            'action' => 'created',
            'new_value' => $punchItem->description,
            'performed_by' => 'System',
        ]);
    }

    /**
     * Log each tracked field that changed during an update.
     *
     * Iterates over a whitelist of tracked fields, comparing original and new
     * values. Creates one ActivityLog entry per changed field.
     *
     * @param PunchItem $punchItem The updated punch item.
     * @return void
     */
    public function updated(PunchItem $punchItem): void
    {
        $changes = $punchItem->getChanges();
        $original = $punchItem->getOriginal();

        $trackedFields = ['status', 'severity', 'trade', 'description', 'location', 'assigned_to', 'suggested_action'];

        foreach ($trackedFields as $field) {
            if (array_key_exists($field, $changes)) {
                $oldValue = $original[$field] ?? null;
                $newValue = $changes[$field];

                // Eloquent may return enum-cast fields as BackedEnum instances;
                // extract the raw string value for storage in the activity log.
                if ($oldValue instanceof \BackedEnum) {
                    $oldValue = $oldValue->value;
                }
                if ($newValue instanceof \BackedEnum) {
                    $newValue = $newValue->value;
                }

                ActivityLog::create([
                    'punch_item_id' => $punchItem->id,
                    'action' => "{$field}_changed",
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                    'performed_by' => 'System',
                ]);
            }
        }
    }
}
