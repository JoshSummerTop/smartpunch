<?php

namespace Tests\Feature\Api;

use App\Services\AnthropicService;
use Mockery;
use Tests\TestCase;

class AIAnalysisControllerTest extends TestCase
{
    public function test_analyze_success_returns_data(): void
    {
        $mockResult = [
            'description' => 'Exposed wiring found above ceiling tiles',
            'trade' => 'electrical',
            'severity' => 'critical',
            'suggested_action' => 'Reroute and secure wiring per code',
        ];

        $mock = Mockery::mock(AnthropicService::class);
        $mock->shouldReceive('analyzeImage')
            ->once()
            ->andReturn($mockResult);

        $this->app->instance(AnthropicService::class, $mock);

        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-image-data'),
            'mime_type' => 'image/jpeg',
            'location' => 'Floor 2',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => $mockResult,
            ]);
    }

    public function test_analyze_failure_returns_422(): void
    {
        $mock = Mockery::mock(AnthropicService::class);
        $mock->shouldReceive('analyzeImage')
            ->once()
            ->andThrow(new \RuntimeException('AI analysis failed: connection error'));

        $this->app->instance(AnthropicService::class, $mock);

        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-image-data'),
            'mime_type' => 'image/jpeg',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonStructure(['success', 'message']);
    }

    public function test_validation_missing_image_returns_422(): void
    {
        $response = $this->postJson('/api/ai/analyze', [
            'mime_type' => 'image/jpeg',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_validation_missing_mime_type_returns_422(): void
    {
        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-image-data'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mime_type']);
    }

    public function test_validation_invalid_mime_type_returns_422(): void
    {
        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-image-data'),
            'mime_type' => 'application/pdf',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mime_type']);
    }
}
