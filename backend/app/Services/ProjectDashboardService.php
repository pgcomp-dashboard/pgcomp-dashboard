<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Support\Facades\DB;

class ProjectDashboardService
{
    /**
     * Get project consolidation summary with filters.
     */
    public function getProjectsSummary(?int $professorId = null, ?int $startYear = null, ?int $endYear = null, ?string $status = null)
    {
        $query = Project::query()
            ->when($professorId, function ($q) use ($professorId) {
                $q->whereHas('participants', function ($q) use ($professorId) {
                    $q->where('users.id', $professorId);
                });
            })
             $query = Project::query()
            ->when($startYear, function ($q) use ($startYear) {
            $q->where('start_year', '>=', $startYear);
            })
           ->when($endYear, function ($q) use ($endYear) {
            $q->where(function ($q) use ($endYear) {
                $q->where('end_year', '<=', $endYear)->orWhereNull('end_year');
            });
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            });

        $projects = $query->get();

        return [
            'total' => $projects->count(),
            'total_nacional' => $projects->filter(
            fn($p) => !str_contains(strtoupper($p->nature ?? ''), 'INTERN'))->count(),
            'total_internacional' => $projects->filter(fn($p) => str_contains(strtoupper($p->nature ?? ''), 'INTERN'))->count(),
            'total_abertos' => $projects->filter(fn($p) => str_contains(strtoupper($p->status ?? ''), 'EM_ANDAMENTO') || str_contains(strtoupper($p->status ?? ''), 'ANDAMENTO'))->count(),
            'total_concluidos' => $projects->filter(fn($p) => str_contains(strtoupper($p->status ?? ''), 'CONCLU'))->count(),
            'total_valor' => $projects->sum('value'),
        ];
    }

    /**
     * Get projects list for table with filters.
     */
    public function getProjectsSummary(?int $professorId = null, ?int $startYear = null, ?int $endYear = null, ?string $status = null)
    {
        return Project::with('participants:id,name')
            ->when($professorId, function ($q) use ($professorId) {
                $q->whereHas('participants', function ($q) use ($professorId) {
                    $q->where('users.id', $professorId);
                });
            })
            $query = Project::query()
           ->when($startYear, function ($q) use ($startYear) {
            $q->where('start_year', '>=', $startYear);
            })
           ->when($endYear, function ($q) use ($endYear) {
            $q->where(function ($q) use ($endYear) {
                $q->where('end_year', '<=', $endYear)->orWhereNull('end_year');
            });
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->orderByDesc('start_year')
            ->get();
    }

    /**
     * Get all professors that have projects.
     */
    public function getProfessorsWithProjects()
    {
        return User::where('type', UserType::PROFESSOR)
            ->whereHas('projects')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }
}