<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;
use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudentController extends BaseApiResourceController
{
    public function store(Request $request)
    {
        $request->merge(['type' => UserType::STUDENT->value]);

        return parent::store($request);
    }

    protected function newBaseQuery(): Builder
    {
        return parent::newBaseQuery()->where('type', UserType::STUDENT);
    }

    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }
}
