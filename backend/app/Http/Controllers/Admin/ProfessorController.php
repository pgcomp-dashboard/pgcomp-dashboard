<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Http\Requests\Admin\StoreProfessorRequest;
use App\Http\Requests\Admin\UpdateProfessorRequest;
use App\Http\Requests\Admin\IndexProfessorRequest;

class ProfessorController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(IndexProfessorRequest $request)
    {
        return UserResource::collection($this->userService->listProfessors($request->validated()));
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
        $updated = $this->userService->update($professor, $request->validated());

        return new UserResource($updated);
    }
    public function destroy(int $id){
        $professor = $this->userService->findProfessor($id);
        $this->userService->delete($professor);

        return response()->json(['message' => 'Professor deletado com sucesso']);
    }
}
