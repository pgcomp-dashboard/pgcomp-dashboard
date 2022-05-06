<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;
use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Production;

class ProductionController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Production::class;
    }

    public function studentQuery($students){
        $this->query = $this->newBaseQuery()
            ->select('productions.id', 'productions.title', 'productions.year',
                'productions.publisher_type', 'productions.publisher_id')
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.id', '=', $students);
    }

    public function professorQuery($professors){
        $this->query = $this->newBaseQuery()
            ->select('productions.id', 'productions.title', 'productions.year',
                'productions.publisher_type', 'productions.publisher_id')
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::PROFESSOR)
            ->where('users.id', '=', $professors);
    }


}
