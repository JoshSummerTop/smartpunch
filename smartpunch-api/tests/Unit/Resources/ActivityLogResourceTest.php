<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ActivityLogResourceTest extends TestCase
{
    #[Test]
    public function it_transforms_activity_log_to_expected_json_structure(): void
    {
        $log = ActivityLog::factory()->create([
            'action' => 'status_changed',
            'old_value' => 'open',
            'new_value' => 'in_progress',
            'performed_by' => 'System',
        ]);

        // Refresh to get database-set created_at
        $log->refresh();

        $resource = new ActivityLogResource($log);
        $data = $resource->toArray(new Request());

        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('punch_item_id', $data);
        $this->assertSame('status_changed', $data['action']);
        $this->assertSame('open', $data['old_value']);
        $this->assertSame('in_progress', $data['new_value']);
        $this->assertSame('System', $data['performed_by']);
        $this->assertArrayHasKey('created_at', $data);
        $this->assertArrayHasKey('created_at_human', $data);
    }

    #[Test]
    public function created_at_human_returns_human_readable_format(): void
    {
        $log = ActivityLog::factory()->create();
        $log->refresh();

        $resource = new ActivityLogResource($log);
        $data = $resource->toArray(new Request());

        // Should be something like "1 second ago"
        $this->assertNotNull($data['created_at_human']);
        $this->assertIsString($data['created_at_human']);
    }
}
