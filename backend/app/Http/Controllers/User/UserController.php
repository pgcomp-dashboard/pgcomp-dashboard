<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ProductionService;
use App\Http\Requests\User\UpdateSelfRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    protected ProductionService $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    public function userInfo(Request $request)
    {
        $user = auth()->user();
        $user->loadCount('writerOf');

        return response()->json([
                'data' => $user
            ]);
    }

    public function updateUserInfo(UpdateSelfRequest $request)
    {
        $user = auth()->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Usuário atualizado com sucesso!',
            'data' => $user,
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['password'])
            ]);

        return response()->json([
            'message' => 'Senha alterada com sucesso',
            ], 200);
    }
}
