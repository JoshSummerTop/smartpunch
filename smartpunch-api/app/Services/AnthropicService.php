<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Claude API integration for AI-powered image analysis and report generation.
 *
 * Sends construction photos to the Anthropic Messages API for deficiency analysis
 * and generates executive summary reports from project data. Degrades gracefully
 * when no API key is configured by returning a fallback report.
 */
class AnthropicService
{
    /** @var string Anthropic API key from config. */
    private string $apiKey;

    /** @var string Claude model identifier. */
    private string $model;

    /** @var string Base URL for the Anthropic API. */
    private string $baseUrl = 'https://api.anthropic.com/v1';

    public function __construct()
    {
        $this->apiKey = config('anthropic.api_key', '');
        $this->model = config('anthropic.model', 'claude-sonnet-4-20250514');
    }

    /**
     * Analyze a construction photo for deficiencies using Claude's vision.
     *
     * Sends the image to the Claude API with a structured prompt and parses
     * the JSON response into description, trade, severity, and suggested action.
     *
     * @param string      $base64Image Base64-encoded image data (no data URI prefix).
     * @param string      $mimeType    Declared MIME type (may be overridden by detection).
     * @param string|null $location    Optional location context for the photo.
     * @return array{description: string, trade: string, severity: string, suggested_action: string}
     *
     * @throws \RuntimeException If the API key is missing, the request fails, or the response is invalid.
     */
    public function analyzeImage(string $base64Image, string $mimeType, ?string $location = null): array
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('Anthropic API key is not configured');
        }

        // Override the declared mime type with the actual type detected from magic bytes,
        // preventing mismatches that cause the API to reject the image.
        $mimeType = $this->detectMimeType($base64Image, $mimeType);

        $locationContext = $location ? " The photo was taken at location: {$location}." : '';

        $prompt = "You are an expert construction inspector analyzing a photo for a punch list (deficiency list). Analyze this construction photo and provide:{$locationContext}

1. **description**: A clear, professional description of the deficiency or issue visible in the photo (2-3 sentences)
2. **trade**: The construction trade responsible. Must be exactly one of: electrical, plumbing, hvac, drywall, painting, flooring, carpentry, roofing, concrete, glazing, landscaping, fire_protection, insulation, general
3. **severity**: The severity level. Must be exactly one of: critical, major, minor, cosmetic
4. **suggested_action**: A specific, actionable recommendation for resolving the issue (1-2 sentences)

Respond ONLY with valid JSON in this exact format:
{\"description\": \"...\", \"trade\": \"...\", \"severity\": \"...\", \"suggested_action\": \"...\"}";

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(60)->post("{$this->baseUrl}/messages", [
                'model' => $this->model,
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image',
                                'source' => [
                                    'type' => 'base64',
                                    'media_type' => $mimeType,
                                    'data' => $base64Image,
                                ],
                            ],
                            [
                                'type' => 'text',
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
            ]);

            if ($response->failed()) {
                $body = $response->json();
                $message = $body['error']['message'] ?? $response->body();
                Log::error('Anthropic API error', ['status' => $response->status(), 'message' => $message]);
                throw new \RuntimeException('AI analysis failed: ' . $message);
            }

            $content = $response->json('content.0.text', '');
            $jsonMatch = [];
            if (preg_match('/\{[^{}]*\}/', $content, $jsonMatch)) {
                $content = $jsonMatch[0];
            }

            $result = json_decode($content, true);

            if (!$result || !isset($result['description'])) {
                throw new \RuntimeException('Invalid AI response format');
            }

            return $result;
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $body = $e->response?->json();
            $message = $body['error']['message'] ?? $e->getMessage();
            Log::error('Anthropic API request error', ['error' => $message]);
            throw new \RuntimeException('AI analysis failed: ' . $message);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Anthropic API connection error', ['error' => $e->getMessage()]);
            throw new \RuntimeException('Unable to connect to AI service');
        }
    }

    /**
     * Detect the actual image MIME type from magic bytes in the base64 data.
     *
     * Decodes the first 16 characters of the base64 string and checks the raw
     * bytes against known file signatures (JPEG FFD8FF, PNG 89504E47, RIFF/WEBP,
     * GIF). Falls back to the declared type if detection fails.
     *
     * @param string $base64Data        Base64-encoded image data.
     * @param string $declaredMimeType  MIME type reported by the client.
     * @return string Detected or declared MIME type.
     */
    private function detectMimeType(string $base64Data, string $declaredMimeType): string
    {
        // Decode just enough bytes to read file signature / magic bytes.
        $header = base64_decode(substr($base64Data, 0, 16));
        if ($header === false) {
            return $declaredMimeType;
        }

        // Check magic bytes for each supported format.
        if (str_starts_with($header, 'RIFF') && str_contains($header, 'WEBP')) {
            return 'image/webp';
        }
        if (str_starts_with($header, "\xFF\xD8\xFF")) {
            return 'image/jpeg';
        }
        if (str_starts_with($header, "\x89PNG")) {
            return 'image/png';
        }
        if (str_starts_with($header, 'GIF')) {
            return 'image/gif';
        }

        return $declaredMimeType;
    }

    /**
     * Generate an AI-powered executive summary report for a project.
     *
     * Falls back to a static template when the API key is missing or the
     * API call fails, ensuring reports are always available.
     *
     * @param array $projectData Aggregated project statistics and item breakdowns.
     * @return string Markdown-formatted report content.
     */
    public function generateReport(array $projectData): string
    {
        // Gracefully degrade: produce a template report without an API key.
        if (empty($this->apiKey)) {
            return $this->generateFallbackReport($projectData);
        }

        $prompt = "You are a construction project manager writing a professional punch list status report. Based on the following project data, write a concise executive summary report.

Project Data:
" . json_encode($projectData, JSON_PRETTY_PRINT) . "

Write a professional report with these sections:
1. **Executive Summary** - Overall project status in 2-3 sentences
2. **Key Findings** - Main issues and their severity breakdown
3. **Critical Items** - List any critical items that need immediate attention
4. **Recommendations** - Top 3 actionable recommendations
5. **Timeline Assessment** - Whether the project is on track based on the target completion date

Keep it concise and professional. Use construction industry terminology.";

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(60)->post("{$this->baseUrl}/messages", [
                'model' => $this->model,
                'max_tokens' => 2048,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->failed()) {
                return $this->generateFallbackReport($projectData);
            }

            return $response->json('content.0.text', $this->generateFallbackReport($projectData));
        } catch (\Exception $e) {
            Log::error('Report generation error', ['error' => $e->getMessage()]);
            return $this->generateFallbackReport($projectData);
        }
    }

    /**
     * Generate a static markdown report when AI is unavailable.
     *
     * Produces a basic statistics-only report from the project data array,
     * used as a fallback when the API key is not set or API calls fail.
     *
     * @param array $projectData Aggregated project statistics.
     * @return string Markdown-formatted fallback report.
     */
    private function generateFallbackReport(array $projectData): string
    {
        $name = $projectData['name'] ?? 'Unknown Project';
        $total = $projectData['total_items'] ?? 0;
        $open = $projectData['open_count'] ?? 0;
        $resolved = $projectData['resolved_count'] ?? 0;
        $completion = $projectData['completion_percentage'] ?? 0;

        return "# Punch List Status Report: {$name}\n\n" .
            "## Executive Summary\n" .
            "This project currently has {$total} punch list items tracked, with {$open} items remaining open " .
            "and {$resolved} items resolved. Overall completion stands at {$completion}%.\n\n" .
            "## Statistics\n" .
            "- **Total Items**: {$total}\n" .
            "- **Open**: {$open}\n" .
            "- **Resolved**: {$resolved}\n" .
            "- **Completion**: {$completion}%\n\n" .
            "*Note: AI-powered report generation requires an Anthropic API key. " .
            "Configure ANTHROPIC_API_KEY in your environment for enhanced reports.*";
    }
}
