<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\User\ProductionController;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\Production;
use Illuminate\Http\Request;

class ProfessorProductionController extends Controller
{
    protected ProductionController $productionController;

    protected Production $production;

    public function index(BaseResourceIndexRequest $request, $professors)
    {
        $this->productionController = $this->newInstance();
        $this->productionController->professorQuery($professors);
        $typeCounts = $this->productionController->getTypeCounts($professors);

        $query = $this->productionController->getQuery();
        $model = new Production;

        $orderBy = $request->input('order_by');
        if ($orderBy && $model->canSortBy($orderBy)) {
            $query->orderBy($orderBy, $request->input('dir', 'asc'));
        }

        (new \App\Http\Filters($query))->applyFilters($request->input('filters', []));

        $response = $query->get()->toArray();

        return response()->json([
            'data' => $response
        ]);

        $response['type_counts'] = [
            'journal' => $typeCounts->journal_count ?? 0,
            'conference' => $typeCounts->conference_count ?? 0,
            'total' => $typeCounts->total_count ?? 0
        ];
    }

    public function show($professors, $productions)
    {
        $this->production = new Production;
        if (empty($this->production->findAllUserProductions($professors, $productions))) {
            abort(400);
        } else {
            $this->productionController = $this->newInstance();

            return $this->productionController->show($productions);
        }
    }

    public function store(Request $request, $professors)
    {
        if ($professors != $request->input('users_id')) {
            abort(400);
        }
        $this->productionController = $this->newInstance();

        return $this->productionController->store($request);
    }

    public function update(Request $request, $professors, $productions)
    {
        $this->productionController = $this->newInstance();

        return $this->productionController->update($request, $productions);
    }

    public function destroy($professors, $productions)
    {
        $this->productionController = $this->newInstance();

        return $this->productionController->destroy($productions);
    }

    private function newInstance()
    {
        return new ProductionController;
    }
}
