<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;
use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Production;
use Illuminate\Http\Request;

class ProductionController extends BaseApiResourceController
{

    protected $selectColumns = ['users.name', 'productions.id', 'productions.title', 'productions.year',
        'productions.publisher_type', 'productions.publisher_id', 'productions.last_qualis',
        'productions.doi'];

    protected function modelClass(): string|BaseModel
    {
        return Production::class;
    }

    public function store(Request $request){
        $saveProduction = parent::store($request);
        $saveProduction->saveInterTable($request->input("users_id"));
        return $saveProduction;
    }

    public function studentQuery($students){
        $this->query = $this->newBaseQuery()
            ->select($this->selectColumns)
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.id', '=', $students);
    }

    public function professorQuery($professors){
        $this->query = $this->newBaseQuery()
            ->select($this->selectColumns)
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::PROFESSOR)
            ->where('users.id', '=', $professors);
    }


}
