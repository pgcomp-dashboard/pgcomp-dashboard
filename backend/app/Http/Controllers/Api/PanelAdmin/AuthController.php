<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        /** @var User | null $user */
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw new AuthenticationException('Credenciais inválidas!');
        }

        $token = $user->createToken('login');
        $userName = $user->name;
        if ($user->is_admin){
            $userRole = ["admin", "basic"];
        } else {
            $userRole = ["basic"];
        }

        return response()->json([
            'token' => $token->plainTextToken,
            'name' => $userName,
            'roles' => $userRole
        ]);
    }
}
