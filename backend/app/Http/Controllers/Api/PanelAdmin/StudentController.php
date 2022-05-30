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
        $user = User::createOrUpdateStudent($request->all());
        $advisor = $request->input("advisor_id");
        $user->advisors()->sync($advisor);
        return $user;
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
