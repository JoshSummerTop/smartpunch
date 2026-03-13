<?php

namespace Tests\Unit\Services;

use App\Services\AnthropicService;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AnthropicServiceTest extends TestCase
{
    #[Test]
    public function detect_mime_type_identifies_jpeg(): void
    {
        $service = new AnthropicService();
        $method = new \ReflectionMethod($service, 'detectMimeType');

        // JPEG header: FF D8 FF
        $base64 = base64_encode("\xFF\xD8\xFF\xE0" . str_repeat("\x00", 12));

        $result = $method->invoke($service, $base64, 'image/png');

        $this->assertSame('image/jpeg', $result);
    }

    #[Test]
    public function detect_mime_type_identifies_png(): void
    {
        $service = new AnthropicService();
        $method = new \ReflectionMethod($service, 'detectMimeType');

        // PNG header: 89 50 4E 47 (0x89 P N G)
        $base64 = base64_encode("\x89PNG\r\n\x1a\n" . str_repeat("\x00", 8));

        $result = $method->invoke($service, $base64, 'application/octet-stream');

        $this->assertSame('image/png', $result);
    }

    #[Test]
    public function detect_mime_type_identifies_webp(): void
    {
        $service = new AnthropicService();
        $method = new \ReflectionMethod($service, 'detectMimeType');

        // WebP header: RIFF....WEBP
        $base64 = base64_encode("RIFF\x00\x00\x00\x00WEBP" . str_repeat("\x00", 4));

        $result = $method->invoke($service, $base64, 'image/jpeg');

        $this->assertSame('image/webp', $result);
    }

    #[Test]
    public function detect_mime_type_identifies_gif(): void
    {
        $service = new AnthropicService();
        $method = new \ReflectionMethod($service, 'detectMimeType');

        $base64 = base64_encode("GIF89a" . str_repeat("\x00", 10));

        $result = $method->invoke($service, $base64, 'image/png');

        $this->assertSame('image/gif', $result);
    }

    #[Test]
    public function detect_mime_type_returns_declared_type_for_unknown(): void
    {
        $service = new AnthropicService();
        $method = new \ReflectionMethod($service, 'detectMimeType');

        $base64 = base64_encode("UNKNOWN_HEADER_DATA");

        $result = $method->invoke($service, $base64, 'image/tiff');

        $this->assertSame('image/tiff', $result);
    }

    #[Test]
    public function analyze_image_returns_parsed_array_on_success(): void
    {
        config(['anthropic.api_key' => 'test-key']);

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [
                    [
                        'type' => 'text',
                        'text' => '{"description": "Cracked drywall", "trade": "drywall", "severity": "minor", "suggested_action": "Patch and repaint"}',
                    ],
                ],
            ], 200),
        ]);

        $service = new AnthropicService();
        $base64 = base64_encode("\xFF\xD8\xFF\xE0" . str_repeat("\x00", 100));

        $result = $service->analyzeImage($base64, 'image/jpeg');

        $this->assertIsArray($result);
        $this->assertSame('Cracked drywall', $result['description']);
        $this->assertSame('drywall', $result['trade']);
        $this->assertSame('minor', $result['severity']);
        $this->assertSame('Patch and repaint', $result['suggested_action']);
    }

    #[Test]
    public function analyze_image_throws_on_api_error(): void
    {
        config(['anthropic.api_key' => 'test-key']);

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'error' => ['message' => 'Rate limited'],
            ], 429),
        ]);

        $service = new AnthropicService();
        $base64 = base64_encode("\xFF\xD8\xFF\xE0" . str_repeat("\x00", 100));

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('AI analysis failed');

        $service->analyzeImage($base64, 'image/jpeg');
    }

    #[Test]
    public function analyze_image_throws_when_no_api_key(): void
    {
        config(['anthropic.api_key' => '']);

        $service = new AnthropicService();
        $base64 = base64_encode("\xFF\xD8\xFF\xE0" . str_repeat("\x00", 100));

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Anthropic API key is not configured');

        $service->analyzeImage($base64, 'image/jpeg');
    }

    #[Test]
    public function generate_report_returns_report_on_success(): void
    {
        config(['anthropic.api_key' => 'test-key']);

        $reportText = '# Report\n\nThis is the AI-generated report.';

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [
                    [
                        'type' => 'text',
                        'text' => $reportText,
                    ],
                ],
            ], 200),
        ]);

        $service = new AnthropicService();
        $result = $service->generateReport(['name' => 'Test Project', 'total_items' => 10]);

        $this->assertSame($reportText, $result);
    }

    #[Test]
    public function generate_report_returns_fallback_when_no_api_key(): void
    {
        config(['anthropic.api_key' => '']);

        $service = new AnthropicService();
        $result = $service->generateReport([
            'name' => 'My Project',
            'total_items' => 5,
            'open_count' => 3,
            'resolved_count' => 2,
            'completion_percentage' => 40,
        ]);

        $this->assertStringContainsString('My Project', $result);
        $this->assertStringContainsString('5 punch list items', $result);
        $this->assertStringContainsString('3 items remaining open', $result);
        $this->assertStringContainsString('40%', $result);
    }

    #[Test]
    public function generate_report_returns_fallback_on_api_error(): void
    {
        config(['anthropic.api_key' => 'test-key']);

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'error' => ['message' => 'Server error'],
            ], 500),
        ]);

        $service = new AnthropicService();
        $result = $service->generateReport([
            'name' => 'Fallback Project',
            'total_items' => 10,
            'open_count' => 5,
            'resolved_count' => 5,
            'completion_percentage' => 50,
        ]);

        $this->assertStringContainsString('Fallback Project', $result);
        $this->assertStringContainsString('50%', $result);
    }
}
