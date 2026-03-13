<?php

namespace Tests\Unit\Models;

use App\Models\ActivityLog;
use App\Models\PunchItem;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    #[Test]
    public function it_uses_uuid_primary_key(): void
    {
        $log = ActivityLog::factory()->create();

        $this->assertTrue(Str::isUuid($log->id));
    }

    #[Test]
    public function it_has_timestamps_disabled(): void
    {
        $log = new ActivityLog();

        $this->assertFalse($log->timestamps);
    }

    #[Test]
    public function it_has_expected_fillable_fields(): void
    {
        $log = new ActivityLog();

        $expected = [
            'punch_item_id',
            'action',
            'old_value',
            'new_value',
            'performed_by',
        ];

        $this->assertEquals($expected, $log->getFillable());
    }

    #[Test]
    public function it_casts_created_at_to_datetime(): void
    {
        $log = ActivityLog::factory()->create();

        // Refresh from DB to get the database-set created_at
        $log->refresh();

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $log->created_at);
    }

    #[Test]
    public function it_belongs_to_a_punch_item(): void
    {
        $log = ActivityLog::factory()->create();

        $this->assertInstanceOf(BelongsTo::class, $log->punchItem());
        $this->assertInstanceOf(PunchItem::class, $log->punchItem);
    }
}
