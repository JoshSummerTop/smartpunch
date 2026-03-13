<?php

namespace Tests\Feature\Validation;

use App\Models\Project;
use App\Models\PunchItem;
use Tests\TestCase;

class UpdateStatusRequestTest extends TestCase
{
    private Project $project;
    private PunchItem $item;

    protected function setUp(): void
    {
        parent::setUp();
        $this->project = Project::factory()->create();
        $this->item = PunchItem::factory()->open()->create(['project_id' => $this->project->id]);
    }

    private function statusUrl(): string
    {
        return "/api/projects/{$this->project->id}/punch-items/{$this->item->id}/status";
    }

    public function test_status_is_required(): void
    {
        $response = $this->putJson($this->statusUrl(), []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_status_must_be_valid_punch_item_status_enum(): void
    {
        $response = $this->putJson($this->statusUrl(), [
            'status' => 'nonexistent',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_valid_status_passes_validation(): void
    {
        $response = $this->putJson($this->statusUrl(), [
            'status' => 'in_progress',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');
    }
}
