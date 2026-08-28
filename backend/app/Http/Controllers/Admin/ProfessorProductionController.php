<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductionService;
use App\Http\Requests\Admin\Production\StoreProductionRequest;
use App\Http\Requests\Admin\Production\UpdateProductionRequest;
use App\Http\Requests\Admin\Production\IndexProductionRequest;
use App\Enums\ProductionSource;
use Illuminate\Http\Request;

class ProfessorProductionController extends Controller
{
    protected ProductionService $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    public function index(IndexProductionRequest $request, $professors)
    {
        $typeCounts = $this->productionService->getTypeCounts($professors);

        $productions = $this->productionService->getProductionsForUser($professors, $request->all());

        return response()->json([
            'data' => $productions->toArray(),
            'type_counts' => [
                'journal' => $typeCounts->journal_count ?? 0,
                'conference' => $typeCounts->conference_count ?? 0,
                'total' => $typeCounts->total_count ?? 0
            ]
        ]);
    }

    public function show($professors, $productions)
    {
        $production = $this->productionService->findForUser($professors, $productions);

        return response()->json($production->load(['publisher', 'publisher.stratumQualis']));
    }

    public function store(StoreProductionRequest $request, $professors)
    {
        $data = $request->validated();
        if (!isset($data['source'])) {
            $data['source'] = ProductionSource::MANUAL->value;
        }

        $production = $this->productionService->store($data, $professors);

        return response()->json($production, 201);
    }

    public function update(UpdateProductionRequest $request, $professors, $productions)
    {
        $production = $this->productionService->updateForUser($professors, $productions, $request->validated());

        return response()->json($production);
    }

    public function destroy($professors, $productions)
    {
        $this->productionService->deleteForUser($professors, $productions);

        return response()->json([
            'status' => '200',
            'message' => 'Deleted successfully'
        ]);
    }

    public function destroyAll($professors)
    {
        $user = \App\Models\User::findOrFail($professors);
        $count = $this->productionService->deleteAllUserProductions($user);

        return response()->json([
            'status' => '200',
            'message' => "Deleted $count productions successfully"
        ]);
    }
    public function storeFromDoi(Request $request, $professors)
    {
        try {
            $result = $this->productionService->createFromDoi(
                (int)$professors,
                $request->input('doi'),
                $request->input('type')
            );

            return response()->json([
                'status' => 201,
                'message' => 'Criado com sucesso',
                'data' => $result['production'],
                'publisher_not_found' => $result['publisher_not_found']
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
