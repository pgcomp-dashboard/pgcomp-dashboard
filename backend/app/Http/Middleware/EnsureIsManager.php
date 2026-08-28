<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Enums\UserType;
use Illuminate\Auth\AuthenticationException;

class EnsureIsManager
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (empty($user)) {
            throw new AuthenticationException;
        }

        if ($user->type !== UserType::MANAGER) {
            return response()->json(['message' => 'Acesso restrito a managers(desenvolvedores) da aplicação.'], 403);
        }

        return $next($request);
    }
}
