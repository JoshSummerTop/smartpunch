<?php

namespace Tests\Feature\Validation;

use App\Models\Project;
use Tests\TestCase;

class UpdateProjectRequestTest extends TestCase
{
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->project = Project::factory()->create();
    }

    public function test_partial_update_is_allowed(): void
    {
        $response = $this->putJson("/api/projects/{$this->project->id}", [
            'address' => 'New Address Only',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.address', 'New Address Only');
    }

    public function test_name_must_be_string_when_present(): void
    {
        $response = $this->putJson("/api/projects/{$this->project->id}", [
            'name' => 12345,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_name_max_255_when_present(): void
    {
        $response = $this->putJson("/api/projects/{$this->project->id}", [
            'name' => str_repeat('a', 256),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_status_must_be_valid_enum_when_present(): void
    {
        $response = $this->putJson("/api/projects/{$this->project->id}", [
            'status' => 'bad_status',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_valid_status_update(): void
    {
        $response = $this->putJson("/api/projects/{$this->project->id}", [
            'status' => 'complete',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'complete');
    }
}
