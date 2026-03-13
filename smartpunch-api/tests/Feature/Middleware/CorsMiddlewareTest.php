<?php

namespace Tests\Feature\Middleware;

use Tests\TestCase;

class CorsMiddlewareTest extends TestCase
{
    public function test_known_origin_gets_specific_cors_headers(): void
    {
        $response = $this->getJson('/api/health', [
            'Origin' => 'http://localhost:4200',
        ]);

        $response->assertStatus(200)
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    }

    public function test_unknown_origin_gets_wildcard_cors(): void
    {
        $response = $this->getJson('/api/health', [
            'Origin' => 'http://unknown-domain.com',
        ]);

        $response->assertStatus(200)
            ->assertHeader('Access-Control-Allow-Origin', '*');
    }

    public function test_options_request_returns_204(): void
    {
        $response = $this->call('OPTIONS', '/api/health', [], [], [], [
            'HTTP_ORIGIN' => 'http://localhost:4200',
        ]);

        $response->assertStatus(204)
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
            ->assertHeader('Access-Control-Allow-Methods');
    }

    public function test_options_request_with_unknown_origin_returns_204(): void
    {
        $response = $this->call('OPTIONS', '/api/health', [], [], [], [
            'HTTP_ORIGIN' => 'http://unknown-domain.com',
        ]);

        $response->assertStatus(204)
            ->assertHeader('Access-Control-Allow-Origin', '*');
    }
}
