<?php

namespace Database\Factories;

use App\Enums\PunchItemStatus;
use App\Enums\Severity;
use App\Enums\Trade;
use App\Models\Project;
use App\Models\PunchItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class PunchItemFactory extends Factory
{
    protected $model = PunchItem::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'item_number' => 'PLI-' . str_pad(fake()->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'description' => fake()->sentence(10),
            'location' => fake()->randomElement(['Floor 1', 'Floor 2', 'Basement', 'Roof', 'Lobby', 'Room 101']),
            'trade' => fake()->randomElement(Trade::cases()),
            'severity' => fake()->randomElement(Severity::cases()),
            'status' => PunchItemStatus::Open,
        ];
    }

    public function open(): static
    {
        return $this->state(fn() => ['status' => PunchItemStatus::Open]);
    }

    public function inProgress(): static
    {
        return $this->state(fn() => ['status' => PunchItemStatus::InProgress]);
    }

    public function resolved(): static
    {
        return $this->state(fn() => ['status' => PunchItemStatus::Resolved]);
    }

    public function verified(): static
    {
        return $this->state(fn() => ['status' => PunchItemStatus::Verified]);
    }

    public function critical(): static
    {
        return $this->state(fn() => ['severity' => Severity::Critical]);
    }

    public function withTrade(Trade $trade): static
    {
        return $this->state(fn() => ['trade' => $trade]);
    }
}
