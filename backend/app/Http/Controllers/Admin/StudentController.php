<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Http\Requests\Admin\IndexStudentRequest;

class StudentController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(IndexStudentRequest $request)
    {
        return UserResource::collection($this->userService->listStudents($request->validated()));
    }

    public function show(int $id)
    {
        $student = $this->userService->findStudent($id);
        return new UserResource($student);
    }

    public function store(StoreStudentRequest $request)
    {
        $user = $this->userService->createOrUpdateStudent($request->validated());

        return new UserResource($user);
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        $student = $this->userService->findStudent($id);
        $updated = $this->userService->update($student, $request->all());

        return new UserResource($updated);
    }
}
