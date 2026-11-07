<?php

namespace App\Domain\DefenseRequests;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Permissão negada com o motivo (403). A policy foi conferida de novo dentro da
 * transação e o cadastro tinha mudado (ex.: a secretaria trocou o orientador).
 */
class DefenseRequestDenied extends RuntimeException
{
    /** Renderiza antes dos callbacks do Handler (que trocariam o motivo por "Não autorizado"). */
    public function render(): JsonResponse
    {
        return response()->json(['errors' => [['description' => $this->getMessage()]]], 403);
    }
}
