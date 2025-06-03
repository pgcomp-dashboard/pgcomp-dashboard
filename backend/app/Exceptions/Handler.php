<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Log;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        ValidationException::class,
        AuthorizationException::class,
        AuthenticationException::class,
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            if ($this->shouldReport($e)) {
                Log::error(
                    'Unhandled Exception: '.$e->getMessage(),
                    ['exception' => $e]
                );
            }
        });

        $this->renderable(function (ValidationException $e) {
            return response()->json(
                ['errors' => array_map(fn ($e) => ['description' => $e], $e->validator->errors()->all())],
                400,
            );
        });

        $this->renderable(function (AuthenticationException $e) {
            return response()->json(
                ['errors' => [
                    ['description' => $e->getMessage()],
                ]],
                401,
            );
        });

        $this->renderable(function (AuthorizationException $e) {
            return response()->json(
                ['errors' => [
                    ['description' => 'Não autorizado'],
                ]],
                403,
            );
        });

        $this->renderable(function (Throwable $e) {
            return response()->json(
                ['errors' => [
                    ['description' => $e->getMessage()],
                ]],
                500,
            );
        });
    }
}
