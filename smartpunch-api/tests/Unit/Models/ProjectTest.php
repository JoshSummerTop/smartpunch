<?php

namespace Tests\Unit\Models;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\PunchItem;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    #[Test]
    public function it_uses_uuid_primary_key(): void
    {
        $project = Project::factory()->create();

        $this->assertTrue(Str::isUuid($project->id));
    }

    #[Test]
    public function it_has_expected_fillable_fields(): void
    {
        $project = new Project();

        $this->assertEquals(
            ['name', 'address', 'client_name', 'target_completion_date', 'status'],
            $project->getFillable()
        );
    }

    #[Test]
    public function it_casts_status_to_project_status_enum(): void
    {
        $project = Project::factory()->create(['status' => 'in_progress']);

        $this->assertInstanceOf(ProjectStatus::class, $project->status);
        $this->assertSame(ProjectStatus::InProgress, $project->status);
    }

    #[Test]
    public function it_casts_target_completion_date_to_date(): void
    {
        $project = Project::factory()->create(['target_completion_date' => '2026-06-15']);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $project->target_completion_date);
        $this->assertSame('2026-06-15', $project->target_completion_date->toDateString());
    }

    #[Test]
    public function it_has_punch_items_relationship(): void
    {
        $project = Project::factory()->create();

        $this->assertInstanceOf(HasMany::class, $project->punchItems());
    }

    #[Test]
    public function open_count_returns_number_of_open_items(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->for($project)->open()->count(3)->create();
        PunchItem::factory()->for($project)->resolved()->count(2)->create();

        $this->assertSame(3, $project->open_count);
    }

    #[Test]
    public function completion_percentage_returns_zero_when_no_items(): void
    {
        $project = Project::factory()->create();

        $this->assertSame(0.0, $project->completion_percentage);
    }

    #[Test]
    public function completion_percentage_calculates_resolved_and_verified(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->for($project)->open()->count(2)->create();
        PunchItem::factory()->for($project)->resolved()->count(1)->create();
        PunchItem::factory()->for($project)->verified()->count(1)->create();

        // 2 out of 4 resolved/verified = 50%
        $this->assertSame(50.0, $project->completion_percentage);
    }

    #[Test]
    public function total_items_returns_count_of_all_punch_items(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->for($project)->count(5)->create();

        $this->assertSame(5, $project->total_items);
    }

    #[Test]
    public function resolved_count_returns_resolved_and_verified_items(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->for($project)->open()->count(1)->create();
        PunchItem::factory()->for($project)->resolved()->count(2)->create();
        PunchItem::factory()->for($project)->verified()->count(3)->create();

        $this->assertSame(5, $project->resolved_count);
    }
}
