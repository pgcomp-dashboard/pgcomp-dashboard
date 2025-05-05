<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\Production;
use Illuminate\Http\Request;

class StudentProductionController  extends Controller
{

    protected ProductionController $productionController;
    protected Production $production;

    public function index(BaseResourceIndexRequest $request, $students){
        $this->productionController = $this->newInstance();
        $this->productionController->studentQuery($students);
        return $this->productionController->index($request);
    }

    public function show($students, $productions){
        $this->production = new Production();
        if(empty($this->production->findAllUserProductions($students, $productions))){
            abort(400);
        }else {
            $this->productionController = $this->newInstance();
            return $this->productionController->show($productions);
        }
    }

    public function store(Request $request, $students){
        if($students != $request->input("users_id")){
            abort(400);
        }
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
