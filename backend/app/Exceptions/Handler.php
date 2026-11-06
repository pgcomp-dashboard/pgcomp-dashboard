<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
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

        // Cada mensagem leva o campo de origem: o front marca o campo certo em vez de só listar.
        $this->renderable(function (ValidationException $e) {
            $errors = [];
            foreach ($e->validator->errors()->messages() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = ['description' => $message, 'field' => $field];
                }
            }

            return response()->json(['errors' => $errors], 422);
        });

        // Registro ou rota inexistente: 404 com mensagem útil (antes caía no 500 genérico).
        $this->renderable(function (NotFoundHttpException $e, $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            return response()->json(
                ['errors' => [['description' => 'Registro não encontrado. Ele pode ter sido removido; atualize a página.']]],
                404,
            );
        });

        $this->renderable(function (AuthenticationException $e) {
            return response()->json(
                ['errors' => [
                    ['description' => 'Sua sessão expirou. Entre novamente para continuar.'],
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
