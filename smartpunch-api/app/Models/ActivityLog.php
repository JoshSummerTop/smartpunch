<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Audit trail entry for punch item changes.
 *
 * Uses UUID primary keys. Disables Laravel's automatic timestamps in favor of
 * a manually managed created_at column (no updated_at) since log entries are
 * immutable once written.
 *
 * @property string $id
 * @property string $punch_item_id
 * @property string $action
 * @property string|null $old_value
 * @property string|null $new_value
 * @property string $performed_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read PunchItem $punchItem
 */
class ActivityLog extends Model
{
    use HasUuids, HasFactory;

    /** @var bool Disabled because only created_at is used; entries are immutable. */
    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = [
        'punch_item_id',
        'action',
        'old_value',
        'new_value',
        'performed_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the punch item this log entry belongs to.
     *
     * @return BelongsTo<PunchItem, self>
     */
    public function punchItem(): BelongsTo
    {
        return $this->belongsTo(PunchItem::class);
    }
}
