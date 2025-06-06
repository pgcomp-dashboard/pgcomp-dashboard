<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
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
        $response = $this->productionController->index($request);

         $response['type_counts'] = [
            'journal' => $typeCounts->journal_count ?? 0,
            'conference' => $typeCounts->conference_count ?? 0,
            'total' => $typeCounts->total_count ?? 0
        ];
        return $response;
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
