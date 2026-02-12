<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Http\Controllers\BaseApiResourceController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\BaseModel;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreProfessorRequest;
use App\Http\Requests\Admin\UpdateProfessorRequest;

class ProfessorController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        return UserResource::collection($this->userService->listProfessors());
    }

    public function show(int $id)
    {
        $professor = $this->userService->findProfessor($id);

        return new UserResource($professor);
    }

    public function store(StoreProfessorRequest $request)
    {
        $professor = $this->userService->store($request->all());

        return new UserResource($professor);
    }

     public function update(UpdateProfessorRequest $request, int $id)
    {
        $professor = $this->userService->findProfessor($id);
        $updated = $this->userService->update($professor, $request->all());

        return new UserResource($updated);
    }
}
