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
        $subareas = $request->input("subareas");
        $user->advisors()->sync($advisor);
        $this->saveSubareas($user, $subareas);
        return $user;
    }

    public function update(Request $request, int $id)
    {
        $user = parent::update($request, $id);
        $subareas = $request->input("subareas");
        $this->saveSubareas($user, $subareas);
        return $user;
    }

    public function show(int $id){
        return (new \App\Models\User)->findUserSubareas($id);
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
