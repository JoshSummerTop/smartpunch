<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company() . ' ' . fake()->randomElement(['Tower', 'Plaza', 'Center', 'Building']),
            'address' => fake()->address(),
            'client_name' => fake()->company(),
            'target_completion_date' => fake()->dateTimeBetween('+1 month', '+1 year'),
            'status' => ProjectStatus::InProgress,
        ];
    }

    public function complete(): static
    {
        return $this->state(fn() => ['status' => ProjectStatus::Complete]);
    }

    public function pendingVerification(): static
    {
        return $this->state(fn() => ['status' => ProjectStatus::PendingVerification]);
    }
}
