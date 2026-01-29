<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        /** @var User | null $user */
        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw new AuthenticationException('Credenciais inválidas!');
        }

        $token = $user->createToken('login');
        $userName = $user->name;
        $user->is_admin ? $userRole = "admin" : $userRole = "basic";

        return response()->json([
            'token' => $token->plainTextToken,
            'name' => $userName,
            'role' => $userRole
        ]);
    }
}
