<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use App\Http\Requests\Admin\ImportLattesRequest;
use App\Services\ProductionService;

class ProductionController extends Controller
{
    private ProductionService $productionService;

    public function __construct(ProductionService $service)
    {
        $this->productionService = $service;
    }

     public function importLattesFile(ImportLattesRequest $request, User $user)
    {
        $file = $request->file('file');
        $path = $file->store('lattes-files');

        try {
             $data = $this->productionService->importFromLattes($user, $path);
             return response()->json(['data' => $data], 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao importar arquivo', 'error' => $e->getMessage()], 500);
        }
    }

}
