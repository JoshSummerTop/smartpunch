<?php

namespace Tests\Unit\Services;

use App\Models\Project;
use App\Models\PunchItem;
use App\Services\PunchItemNumberGenerator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PunchItemNumberGeneratorTest extends TestCase
{
    private PunchItemNumberGenerator $generator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generator = new PunchItemNumberGenerator();
    }

    #[Test]
    public function it_generates_pli_001_for_first_item(): void
    {
        $project = Project::factory()->create();

        $number = $this->generator->generate($project->id);

        $this->assertSame('PLI-001', $number);
    }

    #[Test]
    public function it_generates_sequential_numbers(): void
    {
        $project = Project::factory()->create();

        PunchItem::factory()->for($project)->create(['item_number' => 'PLI-001']);

        $number = $this->generator->generate($project->id);

        $this->assertSame('PLI-002', $number);
    }

    #[Test]
    public function it_scopes_numbers_per_project(): void
    {
        $projectA = Project::factory()->create();
        $projectB = Project::factory()->create();

        PunchItem::factory()->for($projectA)->create(['item_number' => 'PLI-001']);
        PunchItem::factory()->for($projectA)->create(['item_number' => 'PLI-002']);

        PunchItem::factory()->for($projectB)->create(['item_number' => 'PLI-001']);

        $numberA = $this->generator->generate($projectA->id);
        $numberB = $this->generator->generate($projectB->id);

        $this->assertSame('PLI-003', $numberA);
        $this->assertSame('PLI-002', $numberB);
    }

    #[Test]
    public function it_accounts_for_soft_deleted_items(): void
    {
        $project = Project::factory()->create();

        $item = PunchItem::factory()->for($project)->create(['item_number' => 'PLI-001']);
        $item->delete();

        $number = $this->generator->generate($project->id);

        $this->assertSame('PLI-002', $number);
    }
}
