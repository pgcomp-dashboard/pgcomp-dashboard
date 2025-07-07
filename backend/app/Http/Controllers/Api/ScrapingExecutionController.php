<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ScrapingExecution;
use Illuminate\Http\JsonResponse;
use App\Models\BaseModel;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Controllers\Api\BaseApiResourceController;
use Illuminate\Support\Facades\Redis;
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

    public function getInterval(): JsonResponse
    {
        $interval = Redis::get('scraping:run');

        return response()->json([
            "intervalDays" => $interval
        ]);
    }

  public function setInterval(BaseResourceIndexRequest $request): JsonResponse
{
    $validated = $request->validate(
        [
            'days' => ['required', 'integer', 'min:1', 'max:30'],
        ],
        [
            'days.required' => 'O campo "dias" é obrigatório.',
            'days.integer'  => 'O campo "dias" deve ser um número inteiro.',
            'days.min'      => 'O valor mínimo permitido para "dias" é 1.',
            'days.max'      => 'O valor máximo permitido para "dias" é 30.',
        ]
    );

    Redis::set('scraping:run', $validated['days']);

    return response()->json(["status" => "success",
        "message" => "Execução agendada com sucesso.",
        "days" => $validated['days'],
    ], 201);
}
}
