<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\PunchItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        return [
            'punch_item_id' => PunchItem::factory(),
            'action' => 'created',
            'old_value' => null,
            'new_value' => fake()->sentence(),
            'performed_by' => 'System',
        ];
    }

    public function statusChange(): static
    {
        return $this->state(fn() => [
            'action' => 'status_changed',
            'old_value' => 'open',
            'new_value' => 'in_progress',
        ]);
    }
}
