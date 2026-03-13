<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

/**
 * CRUD controller for construction projects.
 *
 * Supports listing with search (name/client/address) and status filtering,
 * eager-loads punch item counts for list and detail views.
 */
class ProjectController extends Controller
{
    /**
     * List all projects with optional search and status filter.
     *
     * @param Request $request Query params: ?search=, ?status=
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $query = Project::withCount([
            'punchItems',
            'punchItems as open_items_count' => fn($q) => $q->where('status', 'open'),
            'punchItems as resolved_items_count' => fn($q) => $q->whereIn('status', ['resolved', 'verified']),
        ]);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('client_name', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $projects = $query->orderBy('updated_at', 'desc')->get();

        return ProjectResource::collection($projects);
    }

    /**
     * Create a new project.
     *
     * @param StoreProjectRequest $request Validated project data.
     * @return ProjectResource
     */
    public function store(StoreProjectRequest $request)
    {
        $project = Project::create($request->validated());
        return new ProjectResource($project);
    }

    /**
     * Show a single project with punch item counts.
     *
     * @param Project $project Route-model-bound project.
     * @return ProjectResource
     */
    public function show(Project $project)
    {
        $project->loadCount([
            'punchItems',
            'punchItems as open_items_count' => fn($q) => $q->where('status', 'open'),
            'punchItems as resolved_items_count' => fn($q) => $q->whereIn('status', ['resolved', 'verified']),
        ]);

        return new ProjectResource($project);
    }

    /**
     * Update an existing project.
     *
     * @param UpdateProjectRequest $request Validated update data.
     * @param Project              $project Route-model-bound project.
     * @return ProjectResource
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());
        return new ProjectResource($project);
    }

    /**
     * Delete a project.
     *
     * @param Project $project Route-model-bound project.
     * @return \Illuminate\Http\JsonResponse 204 No Content.
     */
    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(null, 204);
    }
}
