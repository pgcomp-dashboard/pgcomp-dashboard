<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Services\ProductionService;
use App\Http\Requests\Admin\IndexUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    protected UserService $userService;
    protected ProductionService $productionService;

    public function __construct(UserService $userService, ProductionService $productionService)
    {
        $this->userService = $userService;
        $this->productionService = $productionService;
    }

    public function index(IndexUserRequest $request): AnonymousResourceCollection
    {
        $users = $this->userService->listAll();
        return UserResource::collection($users);
    }

    public function show(int $id): UserResource
    {
        $user = $this->userService->find($id);
        return new UserResource($user);
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $user = $this->userService->store($request->validated());

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, int $id): UserResource
    {
        $user = $this->userService->find($id);
        $user = $this->userService->update($user, $request->validated());

        return new UserResource($user);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = $this->userService->find($id);
        $user = $this->userService->delete($user);

        return response()->json(['message' => 'User deleted successfully'], 204);
    }
}
