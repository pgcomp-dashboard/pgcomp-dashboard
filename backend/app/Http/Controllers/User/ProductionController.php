<?php

namespace App\Http\Controllers\User;

use App\Enums\ProductionSource;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreProductionRequest;
use App\Http\Requests\User\UpdateProductionRequest;
use App\Http\Resources\ProductionResource;
use App\Models\Production;
use App\Services\ProductionService;
use Exception;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\ImportLattesRequest;


class ProductionController extends Controller
{
    protected ProductionService $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    public function store(StoreProductionRequest $request)
    {
        $userId = $request->input('users_id') ?? auth()->user()->id;

        $production = $this->productionService->store($request->validated(), $userId);

        return new ProductionResource($production);
    }

    public function destroy(int $id)
    {
        $production = Production::findOrFail($id);

        $this->authorize('delete', $production);

        if ($production->delete()) {
            return response()->json(['message' => 'Produção deletada com sucesso'], 200);
        }
        return response()->json(['message' => 'Erro ao excluir'], 500);
    }


    public function userProductions()
    {
        $user = auth()->user();

        $productions = $user->writerOf()
            ->with([
                'publisher:id,name,publisher_type,stratum_qualis_id',
                'publisher.stratumQualis:id,code,score'
            ])
            ->get();

        return ProductionResource::collection($productions);
    }

    public function userCreateProduction(StoreProductionRequest $request)
    {
        $userId = auth()->user()->id;

        $data = $request->validated();
        $data['source'] = ProductionSource::MANUAL->value;

        $production = $this->productionService->store($data, $userId);

        return response()->json([
            'data'=> new ProductionResource($production)
        ]);
    }

    public function productionFromDoi(Request $request)
    {
        $userId = auth()->user()->id;
        $doi = $request->input('doi');
        $type = $request->input('type');

        try {
            $result = $this->productionService->createFromDoi($userId, $doi, $type);

            return response()->json([
                'status'=> 201,
                'message'=>"Criado com sucesso",
                'data'=> new ProductionResource($result['production']),
                'publisher_not_found' => $result['publisher_not_found']
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function update(UpdateProductionRequest $request, int $id)
    {
        $production = Production::findOrFail($id);

        $this->authorize('update', $production);

        $updatedProduction = $this->productionService->update($production, $request->validated());

        return new ProductionResource($updatedProduction);
    }

    public function deleteAll()
    {
        $count = $this->productionService->deleteAllUserProductions(auth()->user());

        return response()->json([
            "status" => 200,
            "data" => "Deleted $count productions"
        ]);
    }


    public function importLattesFile(ImportLattesRequest $request)
    {
        $file = $request->file('file');
        $path = $file->store('lattes-files');
        $user = auth()->user();

        try {
             $data = $this->productionService->importFromLattes($user, $path);
             return response()->json(['data' => $data], 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao importar arquivo', 'error' => $e->getMessage()], 500);
        }
    }
}
