<?php

namespace Tests\Feature\Models;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\PunchItem;
use Tests\TestCase;

class CascadeDeleteTest extends TestCase
{
    public function test_delete_project_cascades_to_punch_items(): void
    {
        $project = Project::factory()->create();
        $item1 = PunchItem::factory()->create(['project_id' => $project->id]);
        $item2 = PunchItem::factory()->create(['project_id' => $project->id]);

        $project->delete();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('punch_items', ['id' => $item1->id]);
        $this->assertDatabaseMissing('punch_items', ['id' => $item2->id]);
    }

    public function test_soft_delete_punch_item_preserves_activity_logs(): void
    {
        $project = Project::factory()->create();
        $item = PunchItem::factory()->create(['project_id' => $project->id]);

        // Observer creates a 'created' log automatically
        $logCount = ActivityLog::where('punch_item_id', $item->id)->count();
        $this->assertGreaterThanOrEqual(1, $logCount);

        // Soft delete the punch item
        $item->delete();

        $this->assertSoftDeleted('punch_items', ['id' => $item->id]);

        // Activity logs should still exist
        $this->assertDatabaseHas('activity_logs', [
            'punch_item_id' => $item->id,
        ]);
    }

    public function test_hard_delete_project_cascades_through_items_to_logs(): void
    {
        $project = Project::factory()->create();
        $item = PunchItem::factory()->create(['project_id' => $project->id]);
        $itemId = $item->id;

        // Observer creates activity log on item creation
        $this->assertDatabaseHas('activity_logs', [
            'punch_item_id' => $itemId,
        ]);

        // Hard delete the project (cascadeOnDelete on punch_items FK,
        // and cascadeOnDelete on activity_logs FK)
        $project->delete();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('punch_items', ['id' => $itemId]);
        $this->assertDatabaseMissing('activity_logs', ['punch_item_id' => $itemId]);
    }
}
