<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\PunchItem;
use App\Services\AnthropicService;
use Mockery;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    public function test_generate_report_success(): void
    {
        $project = Project::factory()->create();

        $mock = Mockery::mock(AnthropicService::class);
        $mock->shouldReceive('generateReport')
            ->once()
            ->andReturn('# Executive Summary Report');

        $this->app->instance(AnthropicService::class, $mock);

        $response = $this->getJson("/api/projects/{$project->id}/report");

        $response->assertStatus(200)
            ->assertJsonStructure(['report', 'project_data'])
            ->assertJsonPath('report', '# Executive Summary Report');
    }

    public function test_report_with_items_contains_correct_counts(): void
    {
        $project = Project::factory()->create();
        PunchItem::factory()->count(3)->open()->create(['project_id' => $project->id]);
        PunchItem::factory()->count(2)->resolved()->create(['project_id' => $project->id]);

        $mock = Mockery::mock(AnthropicService::class);
        $mock->shouldReceive('generateReport')
            ->once()
            ->andReturn('# Report with items');

        $this->app->instance(AnthropicService::class, $mock);

        $response = $this->getJson("/api/projects/{$project->id}/report");

        $response->assertStatus(200);

        $projectData = $response->json('project_data');
        $this->assertEquals(5, $projectData['total_items']);
        $this->assertEquals(3, $projectData['open_count']);
        $this->assertEquals(2, $projectData['resolved_count']);
        $this->assertEquals($project->name, $projectData['name']);
    }

    public function test_report_404_for_nonexistent_project(): void
    {
        $fakeId = '00000000-0000-0000-0000-000000000000';

        $response = $this->getJson("/api/projects/{$fakeId}/report");

        $response->assertStatus(404);
    }
}
