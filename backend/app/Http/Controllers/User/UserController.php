<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ProductionService;
use App\Http\Requests\Admin\ImportLattesRequest;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

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

        return response()->json([
                'data' => $user
            ]);
    }

    public function updateUserInfo(Request $request)
    {
        $user = auth()->user();
        $user->update($request->all());

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

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return response()->noContent();
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
        );

        return response()->noContent();
    }


}
