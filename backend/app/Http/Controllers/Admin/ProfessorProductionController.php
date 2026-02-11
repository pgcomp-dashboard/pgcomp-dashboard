<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Filters;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\Production;
use App\Services\ProductionService;
use Illuminate\Http\Request;

class ProfessorProductionController extends Controller
{
    protected ProductionService $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    public function index(BaseResourceIndexRequest $request, $professors)
    {
        $typeCounts = $this->productionService->getTypeCounts($professors);

        $query = Production::ofUser($professors)
            ->withPublisherAndQualis();

        $model = new Production;

        $orderBy = $request->input('order_by');
        if ($orderBy && $model->canSortBy($orderBy)) {
            $query->orderBy($orderBy, $request->input('dir', 'asc'));
        }

        (new Filters($query))->applyFilters($request->input('filters', []));

        $response = $query->get()->toArray();

        return response()->json([
            'data' => $response,
            'type_counts' => [
                'journal' => $typeCounts->journal_count ?? 0,
                'conference' => $typeCounts->conference_count ?? 0,
                'total' => $typeCounts->total_count ?? 0
            ]
        ]);
    }

    public function show($professors, $productions)
    {
        $production = Production::ofUser($professors)
            ->where('id', $productions)
            ->firstOrFail();

        return response()->json($production->load(['publisher', 'publisher.stratumQualis']));
    }

    public function store(Request $request, $professors)
    {
        if ($professors != $request->input('users_id')) {
            abort(400);
        }

        $production = Production::create($request->all());
        $production->saveInterTable($professors);

        return response()->json($production, 201);
    }

    public function update(Request $request, $professors, $productions)
    {
        $production = Production::ofUser($professors)
            ->where('id', $productions)
            ->firstOrFail();

        $production->update($request->all());

        return response()->json($production);
    }

    public function destroy($professors, $productions)
    {
        $production = Production::ofUser($professors)
            ->where('id', $productions)
            ->firstOrFail();

        $production->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

}
