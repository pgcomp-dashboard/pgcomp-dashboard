<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Enums\UserType;
use App\Models\BaseModel;
use App\Models\Production;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudentProductionController extends BaseApiResourceController
{

    public function store(Request $request)
    {
        $request->merge(['type' => UserType::STUDENT->value]);

        return parent::store($request);
    }

    protected function newBaseQuery(): Builder
    {
        return parent::newBaseQuery()
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=',UserType::STUDENT);
    }

    protected function modelClass(): string|BaseModel
    {
        return Production::class;
    }

}
