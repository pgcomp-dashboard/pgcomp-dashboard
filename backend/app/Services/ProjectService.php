<?php

namespace App\Services;

use App\Domain\Lattes\LattesZipXml;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProjectService
{
    /**
     * Import projects from Lattes ZIP/XML file.
     */
    public function importFromLattes(User $user, string $filePath): array
    {
        $data = LattesZipXml::extractProjects($filePath);
        $this->deleteAllUserProjects($user);

        foreach ($data['projects'] as $projectData) {
            $role = $projectData['role'];
            unset($projectData['role']);

            $project = Project::updateOrCreate(
                ['name' => $projectData['name'], 'start_year' => $projectData['start_year']],
                $projectData
            );

            $project->participants()->syncWithoutDetaching([
                $user->id => ['role' => $role]
            ]);
        }

        return $data;
    }

    /**
     * Store a new project and link to user.
     */
    public function store(array $data, int $userId, string $role = 'Integrante'): Project
    {
        $project = Project::create($data);
        $project->participants()->attach($userId, ['role' => $role]);
        return $project;
    }

    /**
     * Update a project.
     */
    public function update(Project $project, array $data): Project
    {
        $project->update($data);
        return $project;
    }

    /**
     * Delete all projects of a user.
     */
    public function deleteAllUserProjects(User $user): int
    {
        $projects = $user->projects;
        $count = 0;
        foreach ($projects as $project) {
            if ($project->participants()->count() > 1) {
                $project->participants()->detach($user->id);
            } else {
                $project->delete();
            }
            $count++;
        }
        return $count;
    }

    /**
     * Get projects for a specific user with filters.
     */
    public function getProjectsForUser(int $userId)
    {
        return QueryBuilder::for(Project::ofUser($userId))
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::exact('start_year'),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('nature'),
            ])
            ->allowedSorts(['name', 'start_year', 'end_year', 'created_at'])
            ->get();
    }

    /**
     * Find a project by ID for a specific user.
     */
    public function findForUser(int $userId, int $projectId): Project
    {
        return Project::ofUser($userId)
            ->where('id', $projectId)
            ->firstOrFail();
    }

    /**
     * Delete a project for a specific user.
     */
    public function deleteForUser(int $userId, int $projectId): bool
    {
        $project = $this->findForUser($userId, $projectId);

        if ($project->participants()->count() > 1) {
            $project->participants()->detach($userId);
            return true;
        }

        return $project->delete();
    }
}