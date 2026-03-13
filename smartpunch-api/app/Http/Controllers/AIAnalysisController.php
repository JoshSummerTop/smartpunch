<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeImageRequest;
use App\Services\AnthropicService;

/**
 * Controller for AI-powered construction photo analysis.
 *
 * Delegates image analysis to AnthropicService and returns structured
 * deficiency data (description, trade, severity, suggested action).
 */
class AIAnalysisController extends Controller
{
    public function __construct(
        private AnthropicService $anthropicService
    ) {}

    /**
     * Analyze a construction photo and return deficiency details.
     *
     * @param AnalyzeImageRequest $request Validated request with 'image' (base64), 'mime_type', optional 'location'.
     * @return \Illuminate\Http\JsonResponse {success: bool, data?: array, message?: string}
     */
    public function analyze(AnalyzeImageRequest $request)
    {
        try {
            $result = $this->anthropicService->analyzeImage(
                $request->input('image'),
                $request->input('mime_type'),
                $request->input('location')
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
