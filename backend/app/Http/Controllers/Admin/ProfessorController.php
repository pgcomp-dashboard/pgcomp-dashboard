<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Http\Controllers\BaseApiResourceController;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreProfessorRequest;
use App\Http\Requests\Admin\UpdateProfessorRequest;

class ProfessorController extends BaseApiResourceController
{
    public function index(BaseResourceIndexRequest $request)
    {
        $professors = parent::index($request);
        return UserResource::collection($professors);
    }

    public function show(int $id)
    {
        $professor = $this->findOrFail($id);
        return new UserResource($professor);
    }

    public function store(StoreProfessorRequest $request)
    {
        // Type is already merged in prepareForValidation of the request
        $professor = parent::store($request);

        return new UserResource($professor);
    }

    public function update(UpdateProfessorRequest $request, int $id)
    {
        $professor = parent::update($request, $id);

        return new UserResource($professor);
    }

    protected function newBaseQuery(): Builder
    {
        return parent::newBaseQuery()->professors();
    }

    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }
}
