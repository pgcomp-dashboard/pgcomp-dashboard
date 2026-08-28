<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProjectDashboardService;
use Illuminate\Http\Request;

class ProjectDashboardController extends Controller
{
    protected ProjectDashboardService $service;

    public function __construct(ProjectDashboardService $service)
    {
        $this->service = $service;
    }

    /**
     * Get projects summary for dashboard.
     */
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'professor_id' => 'nullable|integer|exists:users,id',
            'start_year' => 'nullable|integer|min:1900',
            'end_year' => 'nullable|integer|min:1900',
            'status' => 'nullable|string',
        ]);

        $data = $this->service->getProjectsSummary(
            professorId: $validated['professor_id'] ?? null,
            startYear: $validated['start_year'] ?? null,
            endYear: $validated['end_year'] ?? null,
            status: $validated['status'] ?? null,
        );

        return response()->json($data);
    }

    /**
     * Get projects table for dashboard.
     */
    public function table(Request $request)
    {
        $validated = $request->validate([
            'professor_id' => 'nullable|integer|exists:users,id',
            'start_year' => 'nullable|integer|min:1900',
            'end_year' => 'nullable|integer|min:1900',
            'status' => 'nullable|string',
        ]);

        $data = $this->service->getProjectsTable(
            professorId: $validated['professor_id'] ?? null,
            startYear: $validated['start_year'] ?? null,
            endYear: $validated['end_year'] ?? null,
            status: $validated['status'] ?? null,
        );

        return response()->json([ 'data' => $data ]);
    }

    /**
     * Get professors with projects.
     */
    public function professors()
    {
        return response()->json([
            'data' => $this->service->getProfessorsWithProjects(),
        ]);
    }
}