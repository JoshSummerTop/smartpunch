<?php

namespace Tests\Feature\Api;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\PunchItem;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    public function test_list_returns_all_projects_with_counts(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->count(3)->open()->create(['project_id' => $project->id]);
        PunchItem::factory()->resolved()->create(['project_id' => $project->id]);

        $response = $this->getJson('/api/projects');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', $project->name)
            ->assertJsonPath('data.0.punch_items_count', 4)
            ->assertJsonPath('data.0.open_items_count', 3)
            ->assertJsonPath('data.0.resolved_items_count', 1);
    }

    public function test_create_with_valid_data_returns_201(): void
    {
        $data = [
            'name' => 'New Tower Project',
            'address' => '123 Main St',
            'client_name' => 'Acme Corp',
            'target_completion_date' => now()->addMonths(3)->toDateString(),
            'status' => 'in_progress',
        ];

        $response = $this->postJson('/api/projects', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Tower Project')
            ->assertJsonPath('data.address', '123 Main St')
            ->assertJsonPath('data.client_name', 'Acme Corp')
            ->assertJsonPath('data.status', 'in_progress');

        $this->assertDatabaseHas('projects', ['name' => 'New Tower Project']);
    }

    public function test_show_returns_single_project(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->count(2)->open()->create(['project_id' => $project->id]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $project->id)
            ->assertJsonPath('data.name', $project->name)
            ->assertJsonPath('data.punch_items_count', 2)
            ->assertJsonPath('data.open_items_count', 2);
    }

    public function test_update_modifies_project(): void
    {
        $project = Project::factory()->create(['name' => 'Old Name']);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_delete_returns_204(): void
    {
        $project = Project::factory()->create();

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_search_by_name_filters_results(): void
    {
        Project::factory()->create(['name' => 'Alpha Tower']);
        Project::factory()->create(['name' => 'Beta Plaza']);
        Project::factory()->create(['name' => 'Alpha Center']);

        $response = $this->getJson('/api/projects?search=Alpha');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_status_filter_works(): void
    {
        Project::factory()->create(['status' => ProjectStatus::InProgress]);
        Project::factory()->create(['status' => ProjectStatus::Complete]);
        Project::factory()->create(['status' => ProjectStatus::InProgress]);

        $response = $this->getJson('/api/projects?status=in_progress');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_404_for_nonexistent_project(): void
    {
        $fakeId = '00000000-0000-0000-0000-000000000000';

        $response = $this->getJson("/api/projects/{$fakeId}");

        $response->assertStatus(404);
    }

    public function test_validation_errors_for_missing_name_on_create(): void
    {
        $response = $this->postJson('/api/projects', [
            'address' => '123 Main St',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_validation_errors_for_invalid_status(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => 'Test Project',
            'status' => 'invalid_status',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }
}
