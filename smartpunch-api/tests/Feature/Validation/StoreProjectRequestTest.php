<?php

namespace Tests\Feature\Validation;

use Tests\TestCase;

class StoreProjectRequestTest extends TestCase
{
    public function test_name_is_required(): void
    {
        $response = $this->postJson('/api/projects', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_name_must_be_string(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => 12345,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_name_max_255_characters(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => str_repeat('a', 256),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_target_completion_date_must_be_after_today(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => 'Test Project',
            'target_completion_date' => now()->subDay()->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['target_completion_date']);
    }

    public function test_status_must_be_valid_enum(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => 'Test Project',
            'status' => 'nonexistent_status',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_valid_data_passes_validation(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => 'Valid Project',
            'address' => '123 Main St',
            'client_name' => 'Acme Corp',
            'target_completion_date' => now()->addMonth()->toDateString(),
            'status' => 'in_progress',
        ]);

        $response->assertStatus(201);
    }
}
