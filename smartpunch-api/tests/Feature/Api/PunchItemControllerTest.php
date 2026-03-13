<?php

namespace Tests\Feature\Api;

use App\Enums\PunchItemStatus;
use App\Enums\Severity;
use App\Enums\Trade;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\PunchItem;
use Tests\TestCase;

class PunchItemControllerTest extends TestCase
{
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->project = Project::factory()->create();
    }

    public function test_list_items_for_project(): void
    {
        PunchItem::factory()->count(3)->create(['project_id' => $this->project->id]);

        // Items belonging to another project should not appear
        PunchItem::factory()->create();

        $response = $this->getJson("/api/projects/{$this->project->id}/punch-items");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_create_item_auto_generates_item_number(): void
    {
        $data = [
            'description' => 'Exposed wiring in ceiling',
            'trade' => 'electrical',
            'severity' => 'critical',
            'location' => 'Floor 2',
        ];

        $response = $this->postJson(
            "/api/projects/{$this->project->id}/punch-items",
            $data
        );

        $response->assertStatus(201)
            ->assertJsonPath('data.item_number', 'PLI-001')
            ->assertJsonPath('data.description', 'Exposed wiring in ceiling')
            ->assertJsonPath('data.trade', 'electrical')
            ->assertJsonPath('data.severity', 'critical')
            ->assertJsonPath('data.location', 'Floor 2');

        $this->assertDatabaseHas('punch_items', [
            'project_id' => $this->project->id,
            'item_number' => 'PLI-001',
            'description' => 'Exposed wiring in ceiling',
        ]);
    }

    public function test_show_item_with_activity_logs(): void
    {
        $item = PunchItem::factory()->create(['project_id' => $this->project->id]);
        // The observer creates a 'created' log automatically.
        // Add another activity log explicitly.
        ActivityLog::factory()->create([
            'punch_item_id' => $item->id,
            'action' => 'status_changed',
            'old_value' => 'open',
            'new_value' => 'in_progress',
        ]);

        $response = $this->getJson(
            "/api/projects/{$this->project->id}/punch-items/{$item->id}"
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $item->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'item_number',
                    'description',
                    'activity_logs',
                ],
            ]);

        $this->assertGreaterThanOrEqual(2, count($response->json('data.activity_logs')));
    }

    public function test_update_item_fields(): void
    {
        $item = PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'description' => 'Old description',
        ]);

        $response = $this->putJson(
            "/api/projects/{$this->project->id}/punch-items/{$item->id}",
            ['description' => 'Updated description', 'location' => 'Lobby']
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.description', 'Updated description')
            ->assertJsonPath('data.location', 'Lobby');

        $this->assertDatabaseHas('punch_items', [
            'id' => $item->id,
            'description' => 'Updated description',
        ]);
    }

    public function test_delete_soft_deletes_and_returns_204(): void
    {
        $item = PunchItem::factory()->create(['project_id' => $this->project->id]);

        $response = $this->deleteJson(
            "/api/projects/{$this->project->id}/punch-items/{$item->id}"
        );

        $response->assertStatus(204);

        // Soft deleted: still in DB but with deleted_at set
        $this->assertSoftDeleted('punch_items', ['id' => $item->id]);
    }

    public function test_filter_by_trade(): void
    {
        PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'trade' => Trade::Electrical,
        ]);
        PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'trade' => Trade::Plumbing,
        ]);

        $response = $this->getJson(
            "/api/projects/{$this->project->id}/punch-items?trade=electrical"
        );

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.trade', 'electrical');
    }

    public function test_filter_by_severity(): void
    {
        PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'severity' => Severity::Critical,
        ]);
        PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'severity' => Severity::Minor,
        ]);

        $response = $this->getJson(
            "/api/projects/{$this->project->id}/punch-items?severity=critical"
        );

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.severity', 'critical');
    }

    public function test_filter_by_status(): void
    {
        PunchItem::factory()->open()->create(['project_id' => $this->project->id]);
        PunchItem::factory()->resolved()->create(['project_id' => $this->project->id]);

        $response = $this->getJson(
            "/api/projects/{$this->project->id}/punch-items?status=open"
        );

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'open');
    }

    public function test_filter_by_search(): void
    {
        PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'description' => 'Broken window in lobby',
        ]);
        PunchItem::factory()->create([
            'project_id' => $this->project->id,
            'description' => 'Leaking pipe in basement',
        ]);

        $response = $this->getJson(
            "/api/projects/{$this->project->id}/punch-items?search=window"
        );

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_valid_status_transition_open_to_in_progress(): void
    {
        $item = PunchItem::factory()->open()->create([
            'project_id' => $this->project->id,
        ]);

        $response = $this->putJson(
            "/api/projects/{$this->project->id}/punch-items/{$item->id}/status",
            ['status' => 'in_progress']
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');

        $this->assertDatabaseHas('punch_items', [
            'id' => $item->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_invalid_status_transition_open_to_verified(): void
    {
        $item = PunchItem::factory()->open()->create([
            'project_id' => $this->project->id,
        ]);

        $response = $this->putJson(
            "/api/projects/{$this->project->id}/punch-items/{$item->id}/status",
            ['status' => 'verified']
        );

        $response->assertStatus(422)
            ->assertJsonStructure(['message', 'allowed_transitions']);
    }

    public function test_bulk_status_update_some_succeed_some_fail(): void
    {
        $openItem = PunchItem::factory()->open()->create([
            'project_id' => $this->project->id,
        ]);
        $verifiedItem = PunchItem::factory()->verified()->create([
            'project_id' => $this->project->id,
        ]);

        // Transition to in_progress: open -> in_progress is valid,
        // but verified -> in_progress is NOT valid (verified can only go to resolved)
        $response = $this->postJson(
            "/api/projects/{$this->project->id}/punch-items/bulk-status",
            [
                'item_ids' => [$openItem->id, $verifiedItem->id],
                'status' => 'in_progress',
            ]
        );

        $response->assertStatus(200)
            ->assertJsonStructure(['updated', 'failed']);

        $this->assertCount(1, $response->json('updated'));
        $this->assertCount(1, $response->json('failed'));
    }

    public function test_auto_numbering_sequential(): void
    {
        // Create first item
        $this->postJson("/api/projects/{$this->project->id}/punch-items", [
            'description' => 'First item',
            'trade' => 'electrical',
            'severity' => 'critical',
            'location' => 'Floor 1',
        ])->assertJsonPath('data.item_number', 'PLI-001');

        // Create second item
        $this->postJson("/api/projects/{$this->project->id}/punch-items", [
            'description' => 'Second item',
            'trade' => 'plumbing',
            'severity' => 'major',
            'location' => 'Floor 2',
        ])->assertJsonPath('data.item_number', 'PLI-002');

        // Create third item
        $this->postJson("/api/projects/{$this->project->id}/punch-items", [
            'description' => 'Third item',
            'trade' => 'hvac',
            'severity' => 'minor',
            'location' => 'Floor 3',
        ])->assertJsonPath('data.item_number', 'PLI-003');
    }
}
