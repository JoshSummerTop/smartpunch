<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AnthropicService;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Controller for project report generation and PDF export.
 *
 * Aggregates project statistics and delegates to AnthropicService for
 * AI-generated executive summaries. Also provides PDF export via DomPDF.
 */
class ReportController extends Controller
{
    public function __construct(
        private AnthropicService $anthropicService
    ) {}

    /**
     * Generate an AI-powered project status report.
     *
     * Aggregates punch item statistics by severity, trade, and status,
     * then passes the data to AnthropicService for report generation.
     *
     * @param Project $project Route-model-bound project.
     * @return \Illuminate\Http\JsonResponse {report: string, project_data: array}
     */
    public function generate(Project $project)
    {
        $project->loadCount([
            'punchItems',
            'punchItems as open_items_count' => fn($q) => $q->where('status', 'open'),
            'punchItems as resolved_items_count' => fn($q) => $q->whereIn('status', ['resolved', 'verified']),
        ]);

        $items = $project->punchItems()->get();

        $projectData = [
            'name' => $project->name,
            'address' => $project->address,
            'client_name' => $project->client_name,
            'target_completion_date' => $project->target_completion_date?->toDateString(),
            'status' => $project->status?->label(),
            'total_items' => $project->punch_items_count,
            'open_count' => $project->open_items_count,
            'resolved_count' => $project->resolved_items_count,
            'completion_percentage' => $project->punch_items_count > 0
                ? round(($project->resolved_items_count / $project->punch_items_count) * 100, 1)
                : 0,
            'by_severity' => $items->groupBy(fn($i) => $i->severity->value)->map->count()->toArray(),
            'by_trade' => $items->groupBy(fn($i) => $i->trade->value)->map->count()->toArray(),
            'by_status' => $items->groupBy(fn($i) => $i->status->value)->map->count()->toArray(),
            'critical_items' => $items->where('severity', 'critical')->where('status', '!=', 'verified')
                ->map(fn($i) => [
                    'item_number' => $i->item_number,
                    'description' => $i->description,
                    'location' => $i->location,
                    'status' => $i->status->label(),
                ])->values()->toArray(),
        ];

        $report = $this->anthropicService->generateReport($projectData);

        return response()->json([
            'report' => $report,
            'project_data' => $projectData,
        ]);
    }

    /**
     * Export the punch list as a downloadable PDF.
     *
     * Renders the 'reports.punch-list' Blade view with project data and
     * returns it as a PDF download.
     *
     * @param Project $project Route-model-bound project.
     * @return \Illuminate\Http\Response PDF file download.
     */
    public function exportPdf(Project $project)
    {
        try {
            $project->loadCount([
                'punchItems',
                'punchItems as open_items_count' => fn($q) => $q->where('status', 'open'),
                'punchItems as resolved_items_count' => fn($q) => $q->whereIn('status', ['resolved', 'verified']),
            ]);

            $items = $project->punchItems()->orderBy('item_number')->get();

            $pdf = Pdf::loadView('reports.punch-list', [
                'project' => $project,
                'items' => $items,
                'generatedAt' => now()->format('F j, Y g:i A'),
            ]);

            return $pdf->download("punch-list-{$project->name}.pdf");
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }
}
