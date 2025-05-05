<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements \Laravel\Fortify\Contracts\LoginResponse
{
    /**
     * @param Request $request
     * @return Response|void
     */
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? $request->user()->createToken('admin')->plainTextToken
            : redirect()->intended(Fortify::redirects('login'));
    }
}
