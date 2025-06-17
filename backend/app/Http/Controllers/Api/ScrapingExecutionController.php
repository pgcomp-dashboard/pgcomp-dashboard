<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ScrapingExecution;
use Illuminate\Http\JsonResponse;
use App\Models\BaseModel;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Controllers\Api\BaseApiResourceController;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ScrapingExecutionController extends Controller
{
    public function listExecutions(BaseResourceIndexRequest $request): JsonResponse
    {
        $executions = ScrapingExecution::query()
            ->orderBy('executed_at', 'desc')
            ->take(10)
            ->get();

        if ($executions->isEmpty()) {
            throw new NotFoundHttpException('Nenhuma execução encontrada');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Últimas execuções encontradas com sucesso.',
            'data' => $executions,
        ], 200);
    }
}
