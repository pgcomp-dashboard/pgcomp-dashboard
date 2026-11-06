<?php

namespace App\Domain\DefenseRequests;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** A solicitação mudou de estado entre a leitura e a gravação (ex.: dois envios ao mesmo tempo). */
class DefenseRequestConflict extends RuntimeException
{
    /** Renderiza antes dos callbacks do Handler (que transformariam em 500). */
    public function render(): JsonResponse
    {
        return response()->json(['errors' => [['description' => $this->getMessage()]]], 409);
    }
}
