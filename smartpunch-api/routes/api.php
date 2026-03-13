<?php

use App\Http\Controllers\AIAnalysisController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PunchItemController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => response()->json([
    'status' => 'ok',
    'timestamp' => now()->toIso8601String(),
]));

Route::apiResource('projects', ProjectController::class);

Route::prefix('projects/{project}')->group(function () {
    Route::apiResource('punch-items', PunchItemController::class);
    Route::put('punch-items/{punch_item}/status', [PunchItemController::class, 'updateStatus']);
    Route::post('punch-items/bulk-status', [PunchItemController::class, 'bulkStatus']);

    Route::get('report', [ReportController::class, 'generate']);
    Route::get('report/pdf', [ReportController::class, 'exportPdf']);
});

Route::post('ai/analyze', [AIAnalysisController::class, 'analyze']);

Route::post('photos/{punchItem}', [PhotoController::class, 'store']);
Route::get('photos/{punchItem}/{type}', [PhotoController::class, 'show'])->where('type', 'deficiency|resolution');
