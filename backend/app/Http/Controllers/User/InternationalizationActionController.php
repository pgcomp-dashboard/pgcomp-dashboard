<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Internationalization\ActionRequest;
use App\Http\Resources\InternationalizationActionResource;
use App\Models\InternationalizationAction;
use App\Models\InternationalizationCategory;
use App\Services\InternationalizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Ações de internacionalização do próprio usuário logado (docentes e discentes).
 */
class InternationalizationActionController extends Controller
{
    public function __construct(private InternationalizationService $service)
    {
    }

    public function categories()
    {
        return response()->json([
            'data' => InternationalizationCategory::orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function index(Request $request)
    {
        $actions = InternationalizationAction::with('category', 'files')
            ->ofUser($request->user()->id)
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get();

        return InternationalizationActionResource::collection($actions);
    }

    public function store(ActionRequest $request)
    {
        $action = $this->service->create(
            $request->safe()->except(['files', 'remove_files']),
            $request->user()->id,
            $request->file('files', []),
        );

        return (new InternationalizationActionResource($action))->response()->setStatusCode(201);
    }

    /** Atualiza via POST porque o PHP não lê multipart em PUT. */
    public function update(ActionRequest $request, InternationalizationAction $internationalizationAction)
    {
        if ($denied = $this->denyUnlessOwner($request, $internationalizationAction)) {
            return $denied;
        }

        $updated = $this->service->update(
            $internationalizationAction,
            $request->safe()->except(['files', 'remove_files']),
            $request->file('files', []),
            $request->input('remove_files', []),
        );

        return new InternationalizationActionResource($updated);
    }

    public function destroy(Request $request, InternationalizationAction $internationalizationAction)
    {
        if ($denied = $this->denyUnlessOwner($request, $internationalizationAction)) {
            return $denied;
        }

        $this->service->delete($internationalizationAction);

        return response()->json(['message' => 'Ação excluída com sucesso']);
    }

    public function file(Request $request, InternationalizationAction $internationalizationAction, string $slot)
    {
        if ($denied = $this->denyUnlessOwner($request, $internationalizationAction)) {
            return $denied;
        }

        return $this->service->download($internationalizationAction, $slot);
    }

    /**
     * Responde 403 direto, no formato de erro da API, em vez de lançar exceção
     * (o Handler global converte qualquer exceção em 500).
     */
    private function denyUnlessOwner(Request $request, InternationalizationAction $action): ?JsonResponse
    {
        if ($action->user_id === $request->user()->id) {
            return null;
        }

        return response()->json([
            'errors' => [['description' => 'Esta ação pertence a outro usuário.']],
        ], 403);
    }
}
