<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Award\AwardRequest;
use App\Http\Resources\AwardResource;
use App\Models\Award;
use App\Models\AwardCategory;
use App\Services\AwardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Prêmios do próprio usuário logado (docentes e discentes).
 */
class AwardController extends Controller
{
    public function __construct(private AwardService $service)
    {
    }

    public function categories()
    {
        return response()->json([
            'data' => AwardCategory::orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function index(Request $request)
    {
        $awards = Award::with('category', 'winners')
            ->ofUser($request->user()->id)
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->get();

        return AwardResource::collection($awards);
    }

    public function store(AwardRequest $request)
    {
        $award = $this->service->create(
            $request->safe()->except(['attachment', 'remove_attachment']),
            $request->user()->id,
            $request->file('attachment'),
        );

        return (new AwardResource($award))->response()->setStatusCode(201);
    }

    /**
     * Atualiza via POST porque o PHP não lê multipart em PUT.
     */
    public function update(AwardRequest $request, Award $award)
    {
        if ($denied = $this->denyUnlessOwner($request, $award)) {
            return $denied;
        }

        $updated = $this->service->update(
            $award,
            $request->safe()->except(['attachment', 'remove_attachment']),
            $request->file('attachment'),
            $request->boolean('remove_attachment'),
        );

        return new AwardResource($updated);
    }

    public function destroy(Request $request, Award $award)
    {
        if ($denied = $this->denyUnlessOwner($request, $award)) {
            return $denied;
        }

        $this->service->delete($award);

        return response()->json(['message' => 'Prêmio excluído com sucesso']);
    }

    public function attachment(Request $request, Award $award)
    {
        if ($denied = $this->denyUnlessOwner($request, $award)) {
            return $denied;
        }

        return $this->service->download($award);
    }

    /**
     * Responde 403 direto, no formato de erro da API, em vez de lançar exceção
     * (o Handler global converte qualquer exceção em 500).
     */
    private function denyUnlessOwner(Request $request, Award $award): ?JsonResponse
    {
        if ($award->user_id === $request->user()->id) {
            return null;
        }

        return response()->json([
            'errors' => [['description' => 'Este prêmio pertence a outro usuário.']],
        ], 403);
    }
}
