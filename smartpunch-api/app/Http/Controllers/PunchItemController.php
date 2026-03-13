<?php

namespace App\Http\Controllers;

use App\Enums\PunchItemStatus;
use App\Http\Requests\BulkStatusRequest;
use App\Http\Requests\StorePunchItemRequest;
use App\Http\Requests\UpdatePunchItemRequest;
use App\Http\Requests\UpdateStatusRequest;
use App\Http\Resources\PunchItemResource;
use App\Models\Project;
use App\Models\PunchItem;
use App\Services\PunchItemNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * CRUD controller for punch list items within a project.
 *
 * Supports filtering by trade/severity/status/search, sorting, status
 * transitions with state-machine validation, bulk status updates, and
 * base64 photo handling on create.
 */
class PunchItemController extends Controller
{
    public function __construct(
        private PunchItemNumberGenerator $numberGenerator
    ) {}

    /**
     * List punch items for a project with optional filters and sorting.
     *
     * @param Request $request Query params: ?trade=, ?severity=, ?status=, ?search=, ?sort=, ?direction=
     * @param Project $project Route-model-bound project.
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->punchItems()->with('activityLogs');

        if ($request->has('trade')) {
            $query->where('trade', $request->input('trade'));
        }
        if ($request->has('severity')) {
            $query->where('severity', $request->input('severity'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                  ->orWhere('location', 'LIKE', "%{$search}%")
                  ->orWhere('item_number', 'LIKE', "%{$search}%");
            });
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['created_at', 'item_number', 'severity', 'status', 'trade', 'location'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        return PunchItemResource::collection($query->get());
    }

    /**
     * Create a new punch item with auto-generated item number.
     *
     * Optionally accepts a base64-encoded photo, which is decoded and stored
     * to the public disk.
     *
     * @param StorePunchItemRequest $request Validated item data (may include 'photo' as base64).
     * @param Project               $project Route-model-bound project.
     * @return PunchItemResource
     */
    public function store(StorePunchItemRequest $request, Project $project)
    {
        $data = $request->validated();
        $data['project_id'] = $project->id;
        $data['item_number'] = $this->numberGenerator->generate($project->id);

        if (!empty($data['photo'])) {
            $photoData = base64_decode($data['photo'], true);
            if ($photoData === false) {
                return response()->json(['message' => 'Invalid base64 photo data'], 422);
            }
            $path = "punch-items/{$project->id}/{$data['item_number']}.jpg";
            Storage::disk('public')->put($path, $photoData);
            $data['photo_path'] = $path;
            unset($data['photo']);
        }

        $punchItem = PunchItem::create($data);
        $punchItem->load('activityLogs');

        return new PunchItemResource($punchItem);
    }

    /**
     * Show a single punch item with its activity logs.
     *
     * @param Project   $project   Route-model-bound project.
     * @param PunchItem $punchItem Route-model-bound punch item.
     * @return PunchItemResource
     */
    public function show(Project $project, PunchItem $punchItem)
    {
        $punchItem->load('activityLogs');
        return new PunchItemResource($punchItem);
    }

    /**
     * Update a punch item, validating status transitions against the state machine.
     *
     * @param UpdatePunchItemRequest $request   Validated update data.
     * @param Project                $project   Route-model-bound project.
     * @param PunchItem              $punchItem Route-model-bound punch item.
     * @return PunchItemResource|\Illuminate\Http\JsonResponse 422 if transition is invalid.
     */
    public function update(UpdatePunchItemRequest $request, Project $project, PunchItem $punchItem)
    {
        $data = $request->validated();

        if (isset($data['status'])) {
            $newStatus = PunchItemStatus::from($data['status']);
            if (!$punchItem->status->canTransitionTo($newStatus)) {
                return response()->json([
                    'message' => "Cannot transition from {$punchItem->status->label()} to {$newStatus->label()}",
                    'allowed_transitions' => collect($punchItem->status->allowedTransitions())->map(fn($s) => $s->value),
                ], 422);
            }
        }

        $punchItem->update($data);
        $punchItem->load('activityLogs');

        return new PunchItemResource($punchItem);
    }

    /**
     * Soft-delete a punch item.
     *
     * @param Project   $project   Route-model-bound project.
     * @param PunchItem $punchItem Route-model-bound punch item.
     * @return \Illuminate\Http\JsonResponse 204 No Content.
     */
    public function destroy(Project $project, PunchItem $punchItem)
    {
        $punchItem->delete();
        return response()->json(null, 204);
    }

    /**
     * Update only the status of a punch item, enforcing state-machine rules.
     *
     * @param UpdateStatusRequest $request   Validated request with 'status' field.
     * @param Project             $project   Route-model-bound project.
     * @param PunchItem           $punchItem Route-model-bound punch item.
     * @return PunchItemResource|\Illuminate\Http\JsonResponse 422 if transition is invalid.
     */
    public function updateStatus(UpdateStatusRequest $request, Project $project, PunchItem $punchItem)
    {
        $newStatus = PunchItemStatus::from($request->input('status'));

        if (!$punchItem->status->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => "Cannot transition from {$punchItem->status->label()} to {$newStatus->label()}",
                'allowed_transitions' => collect($punchItem->status->allowedTransitions())->map(fn($s) => $s->value),
            ], 422);
        }

        $punchItem->update(['status' => $newStatus]);
        $punchItem->load('activityLogs');

        return new PunchItemResource($punchItem);
    }

    /**
     * Apply a status change to multiple punch items at once.
     *
     * Validates each item individually against the state machine. Returns
     * separate lists of successfully updated and failed items.
     *
     * @param BulkStatusRequest $request Validated request with 'status' and 'item_ids'.
     * @param Project           $project Route-model-bound project.
     * @return \Illuminate\Http\JsonResponse {updated: string[], failed: array[]}
     */
    public function bulkStatus(BulkStatusRequest $request, Project $project)
    {
        $newStatus = PunchItemStatus::from($request->input('status'));
        $itemIds = $request->input('item_ids');
        $results = ['updated' => [], 'failed' => []];

        foreach ($itemIds as $itemId) {
            $item = PunchItem::find($itemId);
            if (!$item || $item->project_id !== $project->id) {
                $results['failed'][] = ['id' => $itemId, 'reason' => 'Item not found in project'];
                continue;
            }
            if (!$item->status->canTransitionTo($newStatus)) {
                $results['failed'][] = [
                    'id' => $itemId,
                    'item_number' => $item->item_number,
                    'reason' => "Cannot transition from {$item->status->label()} to {$newStatus->label()}",
                ];
                continue;
            }
            $item->update(['status' => $newStatus]);
            $results['updated'][] = $item->item_number;
        }

        return response()->json($results);
    }
}
