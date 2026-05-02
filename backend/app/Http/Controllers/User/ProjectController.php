<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportLattesRequest;
use App\Services\ProjectService;
use Exception;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    private ProjectService $projectService;

    public function __construct(ProjectService $service)
    {
        $this->projectService = $service;
    }

    /**
     * Import projects from Lattes XML/ZIP file for the authenticated user.
     */
    public function importLattesFile(ImportLattesRequest $request)
    {
        $user = $request->user();
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
        //$projects = $this->projectService->getProjectsForUser($request->user()->id);
        //return response()->json([ 'data' => $projects ]);
        try {
        $projects = $request->user()->projects; 
        return response()->json([ 'data' => $projects ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
    }
}