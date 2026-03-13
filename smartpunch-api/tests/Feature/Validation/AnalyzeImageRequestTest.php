<?php

namespace Tests\Feature\Validation;

use Tests\TestCase;

class AnalyzeImageRequestTest extends TestCase
{
    public function test_image_is_required(): void
    {
        $response = $this->postJson('/api/ai/analyze', [
            'mime_type' => 'image/jpeg',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_mime_type_is_required(): void
    {
        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-data'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mime_type']);
    }

    public function test_mime_type_must_be_in_valid_list(): void
    {
        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-data'),
            'mime_type' => 'application/pdf',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mime_type']);
    }

    public function test_valid_jpeg_mime_type_accepted(): void
    {
        // This will fail at the service layer (no mock), but should pass validation.
        // We mock the service to avoid real API calls.
        $mock = \Mockery::mock(\App\Services\AnthropicService::class);
        $mock->shouldReceive('analyzeImage')->andReturn([
            'description' => 'test',
            'trade' => 'general',
            'severity' => 'minor',
            'suggested_action' => 'test',
        ]);
        $this->app->instance(\App\Services\AnthropicService::class, $mock);

        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-data'),
            'mime_type' => 'image/jpeg',
        ]);

        $response->assertStatus(200);
    }

    public function test_valid_png_mime_type_accepted(): void
    {
        $mock = \Mockery::mock(\App\Services\AnthropicService::class);
        $mock->shouldReceive('analyzeImage')->andReturn([
            'description' => 'test',
            'trade' => 'general',
            'severity' => 'minor',
            'suggested_action' => 'test',
        ]);
        $this->app->instance(\App\Services\AnthropicService::class, $mock);

        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-data'),
            'mime_type' => 'image/png',
        ]);

        $response->assertStatus(200);
    }

    public function test_valid_webp_mime_type_accepted(): void
    {
        $mock = \Mockery::mock(\App\Services\AnthropicService::class);
        $mock->shouldReceive('analyzeImage')->andReturn([
            'description' => 'test',
            'trade' => 'general',
            'severity' => 'minor',
            'suggested_action' => 'test',
        ]);
        $this->app->instance(\App\Services\AnthropicService::class, $mock);

        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-data'),
            'mime_type' => 'image/webp',
        ]);

        $response->assertStatus(200);
    }

    public function test_valid_gif_mime_type_accepted(): void
    {
        $mock = \Mockery::mock(\App\Services\AnthropicService::class);
        $mock->shouldReceive('analyzeImage')->andReturn([
            'description' => 'test',
            'trade' => 'general',
            'severity' => 'minor',
            'suggested_action' => 'test',
        ]);
        $this->app->instance(\App\Services\AnthropicService::class, $mock);

        $response = $this->postJson('/api/ai/analyze', [
            'image' => base64_encode('fake-data'),
            'mime_type' => 'image/gif',
        ]);

        $response->assertStatus(200);
    }
}
