<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\RedirectResponse;

class EnsureIsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @param  Closure(Request): (Response|RedirectResponse)  $next
     * @return Response|RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (
            $request->user()
            && $request->user()->type !== UserType::STUDENT
            && !$request->user()->is_approved
        ) {
            return response()->json([
                'message' => 'Seu acesso ainda não foi aprovado por um administrador.'
            ], 403);
        }

        return $next($request);
    }
}
