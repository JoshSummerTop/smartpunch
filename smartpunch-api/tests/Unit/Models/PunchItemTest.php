<?php

namespace Tests\Unit\Models;

use App\Enums\PunchItemStatus;
use App\Enums\Severity;
use App\Enums\Trade;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\PunchItem;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PunchItemTest extends TestCase
{
    #[Test]
    public function it_uses_uuid_primary_key(): void
    {
        $item = PunchItem::factory()->create();

        $this->assertTrue(Str::isUuid($item->id));
    }

    #[Test]
    public function it_supports_soft_deletes(): void
    {
        $item = PunchItem::factory()->create();
        $itemId = $item->id;

        $item->delete();

        $this->assertSoftDeleted('punch_items', ['id' => $itemId]);
        $this->assertNotNull(PunchItem::withTrashed()->find($itemId));
        $this->assertNull(PunchItem::find($itemId));
    }

    #[Test]
    public function it_has_expected_fillable_fields(): void
    {
        $item = new PunchItem();

        $expected = [
            'project_id',
            'item_number',
            'description',
            'location',
            'trade',
            'severity',
            'status',
            'assigned_to',
            'suggested_action',
            'photo_path',
            'resolution_photo_path',
        ];

        $this->assertEquals($expected, $item->getFillable());
    }

    #[Test]
    public function it_casts_status_to_punch_item_status_enum(): void
    {
        $item = PunchItem::factory()->create(['status' => 'open']);

        $this->assertInstanceOf(PunchItemStatus::class, $item->status);
        $this->assertSame(PunchItemStatus::Open, $item->status);
    }

    #[Test]
    public function it_casts_severity_to_severity_enum(): void
    {
        $item = PunchItem::factory()->create(['severity' => 'critical']);

        $this->assertInstanceOf(Severity::class, $item->severity);
        $this->assertSame(Severity::Critical, $item->severity);
    }

    #[Test]
    public function it_casts_trade_to_trade_enum(): void
    {
        $item = PunchItem::factory()->create(['trade' => 'electrical']);

        $this->assertInstanceOf(Trade::class, $item->trade);
        $this->assertSame(Trade::Electrical, $item->trade);
    }

    #[Test]
    public function it_belongs_to_a_project(): void
    {
        $item = PunchItem::factory()->create();

        $this->assertInstanceOf(BelongsTo::class, $item->project());
        $this->assertInstanceOf(Project::class, $item->project);
    }

    #[Test]
    public function it_has_many_activity_logs(): void
    {
        $item = PunchItem::factory()->create();

        $this->assertInstanceOf(HasMany::class, $item->activityLogs());
    }

    #[Test]
    public function days_open_returns_days_since_creation(): void
    {
        $item = PunchItem::factory()->create();

        // Just-created item should be 0 days open
        $this->assertSame(0, $item->days_open);
    }
}
