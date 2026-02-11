<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Http\Controllers\BaseApiResourceController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreProfessorRequest;
use App\Http\Requests\Admin\UpdateProfessorRequest;

class ProfessorController extends Controller
{
    public function index(BaseResourceIndexRequest $request)
    {
        $professors = User::professors()->get();
        return UserResource::collection($professors);
    }

    public function show(int $id)
    {
        $professor = User::findOrFail($id);
        return new UserResource($professor);
    }

    public function store(StoreProfessorRequest $request)
    {
        $professor = User::create($request->all());

        return new UserResource($professor);
    }

     public function update(UpdateProfessorRequest $request, int $id)
    {
        $model = User::findOrFail($id);

        $model->update($request->all());

        return new UserResource($model);
    }
}
