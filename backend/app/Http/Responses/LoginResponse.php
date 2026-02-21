<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements \Laravel\Fortify\Contracts\LoginResponse
{
    /**
     * @param  Request  $request
     * @return Response|void
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            $user = $request->user();
            return response()->json([
                'token' => $user->createToken('login')->plainTextToken,
                'name' => $user->name,
                'role' => $user->is_admin ? 'admin' : 'basic'
            ]);
        }

        return redirect()->intended(Fortify::redirects('login'));
    }
}
