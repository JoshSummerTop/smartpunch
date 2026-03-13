<?php

namespace Tests\Feature\Validation;

use App\Models\Project;
use App\Models\PunchItem;
use Tests\TestCase;

class BulkStatusRequestTest extends TestCase
{
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->project = Project::factory()->create();
    }

    private function bulkUrl(): string
    {
        return "/api/projects/{$this->project->id}/punch-items/bulk-status";
    }

    public function test_item_ids_is_required(): void
    {
        $response = $this->postJson($this->bulkUrl(), [
            'status' => 'in_progress',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['item_ids']);
    }

    public function test_item_ids_must_be_array(): void
    {
        $response = $this->postJson($this->bulkUrl(), [
            'item_ids' => 'not-an-array',
            'status' => 'in_progress',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['item_ids']);
    }

    public function test_item_ids_must_have_at_least_one(): void
    {
        $response = $this->postJson($this->bulkUrl(), [
            'item_ids' => [],
            'status' => 'in_progress',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['item_ids']);
    }

    public function test_status_is_required(): void
    {
        $item = PunchItem::factory()->create(['project_id' => $this->project->id]);

        $response = $this->postJson($this->bulkUrl(), [
            'item_ids' => [$item->id],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_status_must_be_valid_enum(): void
    {
        $item = PunchItem::factory()->create(['project_id' => $this->project->id]);

        $response = $this->postJson($this->bulkUrl(), [
            'item_ids' => [$item->id],
            'status' => 'invalid_status',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_valid_bulk_request_passes(): void
    {
        $item = PunchItem::factory()->open()->create(['project_id' => $this->project->id]);

        $response = $this->postJson($this->bulkUrl(), [
            'item_ids' => [$item->id],
            'status' => 'in_progress',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['updated', 'failed']);
    }
}
