<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\PunchItemResource;
use App\Models\PunchItem;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PunchItemResourceTest extends TestCase
{
    #[Test]
    public function it_transforms_punch_item_to_expected_json_structure(): void
    {
        $item = PunchItem::factory()->create([
            'description' => 'Broken outlet',
            'location' => 'Room 101',
            'trade' => 'electrical',
            'severity' => 'major',
            'status' => 'open',
            'assigned_to' => 'Jane Doe',
            'suggested_action' => 'Replace outlet',
        ]);

        $resource = new PunchItemResource($item);
        $data = $resource->toArray(new Request());

        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('project_id', $data);
        $this->assertArrayHasKey('item_number', $data);
        $this->assertSame('Broken outlet', $data['description']);
        $this->assertSame('Room 101', $data['location']);
        $this->assertSame('electrical', $data['trade']);
        $this->assertSame('Electrical', $data['trade_label']);
        $this->assertSame('major', $data['severity']);
        $this->assertSame('Major', $data['severity_label']);
        $this->assertSame('open', $data['status']);
        $this->assertSame('Open', $data['status_label']);
        $this->assertSame('Jane Doe', $data['assigned_to']);
        $this->assertSame('Replace outlet', $data['suggested_action']);
        $this->assertArrayHasKey('allowed_transitions', $data);
        $this->assertArrayHasKey('days_open', $data);
        $this->assertArrayHasKey('created_at', $data);
        $this->assertArrayHasKey('updated_at', $data);
    }

    #[Test]
    public function allowed_transitions_has_correct_format(): void
    {
        $item = PunchItem::factory()->open()->create();

        $resource = new PunchItemResource($item);
        $data = $resource->toArray(new Request());

        $transitions = $data['allowed_transitions'];

        $this->assertIsArray($transitions);
        $this->assertCount(2, $transitions); // Open -> InProgress, Resolved

        foreach ($transitions as $transition) {
            $this->assertArrayHasKey('value', $transition);
            $this->assertArrayHasKey('label', $transition);
        }

        $values = array_column($transitions, 'value');
        $this->assertContains('in_progress', $values);
        $this->assertContains('resolved', $values);
    }

    #[Test]
    public function photo_url_is_built_when_photo_path_exists(): void
    {
        $item = PunchItem::factory()->create(['photo_path' => 'photos/deficiency.jpg']);

        $resource = new PunchItemResource($item);
        $data = $resource->toArray(new Request());

        $this->assertNotNull($data['photo_url']);
        $this->assertStringContainsString("api/photos/{$item->id}/deficiency", $data['photo_url']);
    }

    #[Test]
    public function photo_url_is_null_when_no_photo_path(): void
    {
        $item = PunchItem::factory()->create(['photo_path' => null]);

        $resource = new PunchItemResource($item);
        $data = $resource->toArray(new Request());

        $this->assertNull($data['photo_url']);
    }

    #[Test]
    public function resolution_photo_url_is_built_when_path_exists(): void
    {
        $item = PunchItem::factory()->create(['resolution_photo_path' => 'photos/resolution.jpg']);

        $resource = new PunchItemResource($item);
        $data = $resource->toArray(new Request());

        $this->assertNotNull($data['resolution_photo_url']);
        $this->assertStringContainsString("api/photos/{$item->id}/resolution", $data['resolution_photo_url']);
    }

    #[Test]
    public function resolution_photo_url_is_null_when_no_path(): void
    {
        $item = PunchItem::factory()->create(['resolution_photo_path' => null]);

        $resource = new PunchItemResource($item);
        $data = $resource->toArray(new Request());

        $this->assertNull($data['resolution_photo_url']);
    }
}
