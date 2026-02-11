<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\BaseModel;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;

class StudentController extends BaseApiResourceController
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        parent::__construct();
        $this->userService = $userService;
    }

    public function index(BaseResourceIndexRequest $request)
    {
        $students = parent::index($request);
        return UserResource::collection($students);
    }

    public function show(int $id)
    {
        $student = $this->findOrFail($id);
        return new UserResource($student);
    }

    public function store(StoreStudentRequest $request)
    {
        $user = $this->userService->createOrUpdateStudent($request->validated());
        $advisor = $request->input('advisor_id');
        $user->advisors()->sync($advisor);

        return new UserResource($user);
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        $user = parent::update($request, $id);

        return new UserResource($user);
    }

    protected function newBaseQuery(): Builder
    {
        return parent::newBaseQuery()->students();
    }

    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }
}
