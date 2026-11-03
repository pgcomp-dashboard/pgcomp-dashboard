<?php

namespace App\Http\Controllers\User;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportLattesRequest;
use App\Services\ProjectService;
use App\Services\SystemFunctionService;
use Exception;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    private ProjectService $projectService;
    private SystemFunctionService $systemFunctionService;

    public function __construct(
        ProjectService $service,
        SystemFunctionService $systemFunctionService,
    ) {
        $this->projectService = $service;
        $this->systemFunctionService = $systemFunctionService;
    }

    /**
     * Import projects from Lattes XML/ZIP file for the authenticated user.
     */
    public function importLattesFile(ImportLattesRequest $request)
    {
        $user = $request->user();
        if (
            $user->type === UserType::STUDENT
            && !$this->systemFunctionService->isLattesXmlUploadEnabled()
        ) {
            return response()->json([
                'message' => SystemFunctionService::LATTES_XML_UPLOAD_DISABLED_MESSAGE,
            ], 403);
        }

        $path = $request->file('file')->store('lattes-files');

        try {
            $data = $this->projectService->importFromLattes($user, $path);
            return response()->json([ 'data' => $data ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Erro ao importar arquivo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List projects of the authenticated user.
     */
    public function index(Request $request)
    {
        $projects = $this->projectService->getProjectsForUser($request->user()->id);
        return response()->json([ 'data' => $projects ]);
    }
}