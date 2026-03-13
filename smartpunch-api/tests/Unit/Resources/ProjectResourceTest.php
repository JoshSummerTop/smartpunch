<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\PunchItem;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectResourceTest extends TestCase
{
    #[Test]
    public function it_transforms_project_to_expected_json_structure(): void
    {
        $project = Project::factory()->create([
            'name' => 'Test Tower',
            'address' => '123 Main St',
            'client_name' => 'ACME Corp',
            'target_completion_date' => '2026-12-31',
            'status' => 'in_progress',
        ]);

        $resource = new ProjectResource($project);
        $data = $resource->toArray(new Request());

        $this->assertArrayHasKey('id', $data);
        $this->assertSame('Test Tower', $data['name']);
        $this->assertSame('123 Main St', $data['address']);
        $this->assertSame('ACME Corp', $data['client_name']);
        $this->assertSame('2026-12-31', $data['target_completion_date']);
        $this->assertSame('in_progress', $data['status']);
        $this->assertSame('In Progress', $data['status_label']);
        $this->assertArrayHasKey('punch_items_count', $data);
        $this->assertArrayHasKey('open_items_count', $data);
        $this->assertArrayHasKey('resolved_items_count', $data);
        $this->assertArrayHasKey('completion_percentage', $data);
        $this->assertArrayHasKey('created_at', $data);
        $this->assertArrayHasKey('updated_at', $data);
    }

    #[Test]
    public function completion_percentage_works_with_punch_items(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->for($project)->open()->count(2)->create();
        PunchItem::factory()->for($project)->resolved()->count(2)->create();

        $resource = new ProjectResource($project);
        $data = $resource->toArray(new Request());

        // Without withCount, it uses the computed attribute from model: 2/4 = 50%
        $this->assertEquals(50.0, $data['completion_percentage']);
    }
}
