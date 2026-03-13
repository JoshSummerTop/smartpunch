<?php

namespace App\Models;

use App\Enums\PunchItemStatus;
use App\Enums\Severity;
use App\Enums\Trade;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Individual punch list deficiency item.
 *
 * Uses UUID primary keys and soft deletes. Enum casts convert status, severity,
 * and trade columns to their respective BackedEnum types. Each item belongs to
 * a project and has an audit trail via activity logs.
 *
 * @property string $id
 * @property string $project_id
 * @property string $item_number
 * @property string $description
 * @property string|null $location
 * @property Trade $trade
 * @property Severity $severity
 * @property PunchItemStatus $status
 * @property string|null $assigned_to
 * @property string|null $suggested_action
 * @property string|null $photo_path
 * @property string|null $resolution_photo_path
 * @property-read int $days_open
 * @property-read Project $project
 * @property-read \Illuminate\Database\Eloquent\Collection<ActivityLog> $activityLogs
 */
class PunchItem extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    /** @var list<string> */
    protected $fillable = [
        'project_id',
        'item_number',
        'description',
        'location',
        'trade',
        'severity',
        'status',
        'assigned_to',
        'suggested_action',
        'photo_path',
        'resolution_photo_path',
    ];

    protected $casts = [
        'status' => PunchItemStatus::class,
        'severity' => Severity::class,
        'trade' => Trade::class,
    ];

    /**
     * Get the project this punch item belongs to.
     *
     * @return BelongsTo<Project, self>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get all activity log entries for this punch item.
     *
     * @return HasMany<ActivityLog>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the number of days since this item was created.
     *
     * @return int
     */
    public function getDaysOpenAttribute(): int
    {
        return (int) $this->created_at?->diffInDays(now());
    }
}
