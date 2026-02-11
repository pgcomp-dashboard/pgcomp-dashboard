<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Lattes\LattesZipXml;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\BaseModel;
use App\Models\User;
use App\Services\UserService;
use App\Services\ProductionService;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\ImportLattesRequest;

class UserController extends Controller
{
    protected UserService $userService;
    protected ProductionService $productionService;

    public function __construct(UserService $userService, ProductionService $productionService)
    {
        $this->userService = $userService;
        $this->productionService = $productionService;
    }

    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }

    public function index(BaseResourceIndexRequest $request)
    {
        $users = parent::index($request);
        return UserResource::collection($users);
    }

    public function show(int $id)
    {
        $user = $this->findOrFail($id);
        return new UserResource($user);
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->store($request->validated());

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $user = $this->findOrFail($id);
        $user = $this->userService->update($user, $request->validated());

        return new UserResource($user);
    }


}
