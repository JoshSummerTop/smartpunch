<?php

namespace Tests\Unit\Observers;

use App\Models\ActivityLog;
use App\Models\PunchItem;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PunchItemObserverTest extends TestCase
{
    #[Test]
    public function created_event_logs_creation_with_description(): void
    {
        $item = PunchItem::factory()->create(['description' => 'Missing outlet cover']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'created')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('Missing outlet cover', $log->new_value);
        $this->assertSame('System', $log->performed_by);
    }

    #[Test]
    public function status_change_creates_log_with_old_and_new_values(): void
    {
        $item = PunchItem::factory()->open()->create();

        $item->update(['status' => 'in_progress']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'status_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('open', $log->old_value);
        $this->assertSame('in_progress', $log->new_value);
    }

    #[Test]
    public function severity_change_creates_log(): void
    {
        $item = PunchItem::factory()->create(['severity' => 'minor']);

        $item->update(['severity' => 'critical']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'severity_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('minor', $log->old_value);
        $this->assertSame('critical', $log->new_value);
    }

    #[Test]
    public function trade_change_creates_log(): void
    {
        $item = PunchItem::factory()->create(['trade' => 'electrical']);

        $item->update(['trade' => 'plumbing']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'trade_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('electrical', $log->old_value);
        $this->assertSame('plumbing', $log->new_value);
    }

    #[Test]
    public function description_change_creates_log(): void
    {
        $item = PunchItem::factory()->create(['description' => 'Old description']);

        $item->update(['description' => 'New description']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'description_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('Old description', $log->old_value);
        $this->assertSame('New description', $log->new_value);
    }

    #[Test]
    public function location_change_creates_log(): void
    {
        $item = PunchItem::factory()->create(['location' => 'Floor 1']);

        $item->update(['location' => 'Floor 2']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'location_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('Floor 1', $log->old_value);
        $this->assertSame('Floor 2', $log->new_value);
    }

    #[Test]
    public function assigned_to_change_creates_log(): void
    {
        $item = PunchItem::factory()->create(['assigned_to' => null]);

        $item->update(['assigned_to' => 'John Doe']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'assigned_to_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertNull($log->old_value);
        $this->assertSame('John Doe', $log->new_value);
    }

    #[Test]
    public function suggested_action_change_creates_log(): void
    {
        $item = PunchItem::factory()->create(['suggested_action' => 'Fix it']);

        $item->update(['suggested_action' => 'Replace entirely']);

        $log = ActivityLog::where('punch_item_id', $item->id)
            ->where('action', 'suggested_action_changed')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('Fix it', $log->old_value);
        $this->assertSame('Replace entirely', $log->new_value);
    }

    #[Test]
    public function photo_path_change_does_not_create_log(): void
    {
        $item = PunchItem::factory()->create();

        $initialLogCount = ActivityLog::where('punch_item_id', $item->id)->count();

        $item->update(['photo_path' => 'photos/new-photo.jpg']);

        $newLogCount = ActivityLog::where('punch_item_id', $item->id)->count();

        $this->assertSame($initialLogCount, $newLogCount);
    }

    #[Test]
    public function resolution_photo_path_change_does_not_create_log(): void
    {
        $item = PunchItem::factory()->create();

        $initialLogCount = ActivityLog::where('punch_item_id', $item->id)->count();

        $item->update(['resolution_photo_path' => 'photos/resolution.jpg']);

        $newLogCount = ActivityLog::where('punch_item_id', $item->id)->count();

        $this->assertSame($initialLogCount, $newLogCount);
    }

    #[Test]
    public function multiple_simultaneous_changes_create_multiple_log_entries(): void
    {
        $item = PunchItem::factory()->create([
            'status' => 'open',
            'severity' => 'minor',
            'location' => 'Floor 1',
        ]);

        $initialLogCount = ActivityLog::where('punch_item_id', $item->id)->count();

        $item->update([
            'status' => 'in_progress',
            'severity' => 'critical',
            'location' => 'Floor 2',
        ]);

        $newLogs = ActivityLog::where('punch_item_id', $item->id)->count() - $initialLogCount;

        $this->assertSame(3, $newLogs);

        $this->assertNotNull(
            ActivityLog::where('punch_item_id', $item->id)->where('action', 'status_changed')->first()
        );
        $this->assertNotNull(
            ActivityLog::where('punch_item_id', $item->id)->where('action', 'severity_changed')->first()
        );
        $this->assertNotNull(
            ActivityLog::where('punch_item_id', $item->id)->where('action', 'location_changed')->first()
        );
    }
}
