<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Construction project model.
 *
 * Uses UUID primary keys. Tracks overall project metadata (name, address, client,
 * target date) and an enum-based status. Provides computed attributes for punch
 * item counts and completion percentage.
 *
 * @property string $id
 * @property string $name
 * @property string $address
 * @property string $client_name
 * @property \Illuminate\Support\Carbon|null $target_completion_date
 * @property ProjectStatus $status
 * @property-read int $open_count
 * @property-read int $total_items
 * @property-read int $resolved_count
 * @property-read float $completion_percentage
 * @property-read \Illuminate\Database\Eloquent\Collection<PunchItem> $punchItems
 */
class Project extends Model
{
    use HasUuids, HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'name',
        'address',
        'client_name',
        'target_completion_date',
        'status',
    ];

    protected $casts = [
        'status' => ProjectStatus::class,
        'target_completion_date' => 'date',
    ];

    /**
     * Get all punch items belonging to this project.
     *
     * @return HasMany<PunchItem>
     */
    public function punchItems(): HasMany
    {
        return $this->hasMany(PunchItem::class);
    }

    /**
     * Get the number of punch items with "open" status.
     *
     * @return int
     */
    public function getOpenCountAttribute(): int
    {
        return $this->punchItems()->where('status', 'open')->count();
    }

    /**
     * Get the percentage of items that are resolved or verified.
     *
     * @return float Percentage rounded to one decimal place (0.0 - 100.0).
     */
    public function getCompletionPercentageAttribute(): float
    {
        $total = $this->punchItems()->count();
        if ($total === 0) return 0;
        $resolved = $this->punchItems()->whereIn('status', ['resolved', 'verified'])->count();
        return round(($resolved / $total) * 100, 1);
    }

    /**
     * Get the total number of punch items in this project.
     *
     * @return int
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->punchItems()->count();
    }

    /**
     * Get the number of resolved or verified punch items.
     *
     * @return int
     */
    public function getResolvedCountAttribute(): int
    {
        return $this->punchItems()->whereIn('status', ['resolved', 'verified'])->count();
    }
}
