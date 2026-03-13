<?php

namespace Tests\Feature\Validation;

use App\Models\Project;
use App\Models\PunchItem;
use Tests\TestCase;

class UpdatePunchItemRequestTest extends TestCase
{
    private Project $project;
    private PunchItem $item;

    protected function setUp(): void
    {
        parent::setUp();
        $this->project = Project::factory()->create();
        $this->item = PunchItem::factory()->create(['project_id' => $this->project->id]);
    }

    private function updateUrl(): string
    {
        return "/api/projects/{$this->project->id}/punch-items/{$this->item->id}";
    }

    public function test_partial_update_allowed(): void
    {
        $response = $this->putJson($this->updateUrl(), [
            'location' => 'Updated Location',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.location', 'Updated Location');
    }

    public function test_description_must_be_string_when_present(): void
    {
        $response = $this->putJson($this->updateUrl(), [
            'description' => 12345,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['description']);
    }

    public function test_trade_must_be_valid_enum_when_present(): void
    {
        $response = $this->putJson($this->updateUrl(), [
            'trade' => 'invalid_trade',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['trade']);
    }

    public function test_severity_must_be_valid_enum_when_present(): void
    {
        $response = $this->putJson($this->updateUrl(), [
            'severity' => 'extreme',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['severity']);
    }

    public function test_valid_partial_update(): void
    {
        $response = $this->putJson($this->updateUrl(), [
            'description' => 'Revised description',
            'trade' => 'plumbing',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.description', 'Revised description')
            ->assertJsonPath('data.trade', 'plumbing');
    }
}
