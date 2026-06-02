<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Exception;
use App\Http\Requests\Admin\ImportLattesRequest;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    private ProjectService $projectService;

    public function __construct(ProjectService $service)
    {
        $this->projectService = $service;
    }

    /**
     * Import projects from Lattes XML/ZIP file.
     */
    public function importLattesFile(ImportLattesRequest $request, User $user)
    {
        $file = $request->file('file');
        $path = $file->store('lattes-files');

        try {
            $data = $this->projectService->importFromLattes($user, $path);
            return response()->json(['data' => $data], 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao importar arquivo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * List all projects of a professor.
     */
    public function index(User $professor)
    {
        $projects = $this->projectService->getProjectsForUser($professor->id);
        return response()->json(['data' => $projects]);
    }

    /**
     * Store a new project for a professor.
     */
    public function store(Request $request, User $professor)
    {
        $validated = $request->validate(Project::creationRules());

        try {
            $project = $this->projectService->store($validated, $professor->id, $request->input('role', 'Integrante'));
            return response()->json(['data' => $project], 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao criar projeto', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update a project of a professor.
     */
    public function update(Request $request, User $professor, Project $project)
    {
        $validated = $request->validate(Project::creationRules());

        try {
            $updated = $this->projectService->update($project, $validated);
            return response()->json(['data' => $updated]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao atualizar projeto', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a project of a professor.
     */
    public function destroy(User $professor, Project $project)
    {
        try {
            $this->projectService->deleteForUser($professor->id, $project->id);
            return response()->json(['message' => 'Projeto deletado com sucesso'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao deletar projeto', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete all projects of a professor.
     */
    public function destroyAll(User $professor)
    {
        try {
            $this->projectService->deleteAllUserProjects($professor);
            return response()->json(['message' => 'Projetos deletados com sucesso'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao deletar projetos', 'error' => $e->getMessage()], 500);
        }
    }
}