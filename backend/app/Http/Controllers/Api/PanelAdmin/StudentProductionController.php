<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\BaseModel;
use App\Models\Production;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudentProductionController  extends Controller
{

    protected ProductionController $productionController;

    public function index(BaseResourceIndexRequest $request, $students){
        $this->productionController = $this->newInstance();
        $this->productionController->studentQuery($students);
        return $this->productionController->index($request);
    }

    public function show($students, $productions){
        $this->productionController = $this->newInstance();
        return $this->productionController->show($productions);
    }

    public function store(Request $request, $students){
        $this->productionController = $this->newInstance();
        return $this->productionController->store($request);
    }

    public function update(Request $request, $students, $productions){
        $this->productionController = $this->newInstance();
        return $this->productionController->update($request, $productions);
    }

    public function destroy($students, $productions){
        $this->productionController = $this->newInstance();
        return $this->productionController->destroy($productions);
    }

    private function newInstance(){
        return new ProductionController();
    }
}
