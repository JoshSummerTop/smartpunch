<?php

namespace Tests\Feature\Validation;

use App\Models\Project;
use Tests\TestCase;

class StorePunchItemRequestTest extends TestCase
{
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->project = Project::factory()->create();
    }

    private function storeUrl(): string
    {
        return "/api/projects/{$this->project->id}/punch-items";
    }

    public function test_description_is_required(): void
    {
        $response = $this->postJson($this->storeUrl(), [
            'trade' => 'electrical',
            'severity' => 'critical',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['description']);
    }

    public function test_trade_is_required(): void
    {
        $response = $this->postJson($this->storeUrl(), [
            'description' => 'Some deficiency',
            'severity' => 'critical',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['trade']);
    }

    public function test_trade_must_be_valid_enum(): void
    {
        $response = $this->postJson($this->storeUrl(), [
            'description' => 'Some deficiency',
            'trade' => 'invalid_trade',
            'severity' => 'critical',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['trade']);
    }

    public function test_severity_is_required(): void
    {
        $response = $this->postJson($this->storeUrl(), [
            'description' => 'Some deficiency',
            'trade' => 'electrical',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['severity']);
    }

    public function test_severity_must_be_valid_enum(): void
    {
        $response = $this->postJson($this->storeUrl(), [
            'description' => 'Some deficiency',
            'trade' => 'electrical',
            'severity' => 'extreme',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['severity']);
    }

    public function test_valid_data_passes(): void
    {
        $response = $this->postJson($this->storeUrl(), [
            'description' => 'Cracked drywall in corridor',
            'trade' => 'drywall',
            'severity' => 'minor',
            'location' => 'Floor 3',
        ]);

        $response->assertStatus(201);
    }
}
