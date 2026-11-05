<?php

namespace App\Http\Controllers\User;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\DefenseRequests\StoreDefenseRequest;
use App\Http\Resources\DefenseRequestResource;
use App\Models\DefenseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * POC: solicitação de banca (qualificação/defesa de mestrado e doutorado).
 *
 * Personas:
 * - Discente: abre a solicitação para si mesmo. Ela vai para o orientador dele
 *   (status awaiting_advisor), sem as confirmações, que são declarações do orientador.
 * - Orientador (docente): revisa o que o orientando abriu, marca as confirmações e
 *   envia (submitted). Também pode abrir direto para um orientando.
 * - Coordenação (admin): vê todas em /admin, só leitura.
 */
class DefenseRequestController extends Controller
{
    /** Schema dos 4 formulários, para o front montar o wizard de cada tipo. */
    public function forms()
    {
        return response()->json([
            'data' => collect(DefenseRequestForms::all())
                ->map(fn ($form, $type) => ['type' => $type] + DefenseRequestForms::TYPE_MATRIX[$type] + $form)
                ->values(),
        ]);
    }

    /** As que eu abri, as dos meus orientandos e as minhas como discente. */
    public function index(Request $request)
    {
        $me = $request->user()->id;
        $requests = DefenseRequest::with(['user', 'advisor'])
            ->where(fn ($q) => $q->where('user_id', $me)
                ->orWhere('advisor_user_id', $me)
                ->orWhere('student_user_id', $me))
            ->orderByDesc('id')
            ->get();

        return DefenseRequestResource::collection($requests);
    }

    public function store(StoreDefenseRequest $request)
    {
        $user = $request->user();
        $type = $request->validated()['type'];
        $data = DefenseRequestForms::only($type, $request->input('data', []));

        if ($user->type === UserType::STUDENT) {
            // O discente só abre para si mesmo; vai para o orientador vinculado a ele.
            $data['student_name'] = $user->name;
            $attributes = [
                'student_user_id' => $user->id,
                'advisor_user_id' => $user->advisors()->value('users.id'),
                'status' => DefenseRequest::AWAITING_ADVISOR,
            ];
        } else {
            $attributes = [
                'student_user_id' => $request->validated()['student_user_id'] ?? null,
                'advisor_user_id' => $user->id,
                'status' => DefenseRequest::SUBMITTED,
                'submitted_at' => now(),
            ];
        }

        $defenseRequest = DefenseRequest::create($attributes + [
            'user_id' => $user->id,
            'type' => $type,
            'data' => $data,
        ]);

        return (new DefenseRequestResource($defenseRequest->load(['user', 'advisor'])))
            ->response()
            ->setStatusCode(201);
    }

    /** O orientador revisa a solicitação aberta pelo orientando, confirma e envia. */
    public function update(StoreDefenseRequest $request, DefenseRequest $defenseRequest)
    {
        $user = $request->user();
        if ($defenseRequest->advisor_user_id !== $user->id || $defenseRequest->status !== DefenseRequest::AWAITING_ADVISOR) {
            return $this->forbidden('Só o orientador pode revisar e enviar esta solicitação.');
        }

        $type = $request->validated()['type'];
        $defenseRequest->update([
            'type' => $type,
            'data' => DefenseRequestForms::only($type, $request->input('data', [])),
            'status' => DefenseRequest::SUBMITTED,
            'submitted_at' => now(),
        ]);

        return new DefenseRequestResource($defenseRequest->load(['user', 'advisor']));
    }

    /** Responde 403 no formato de erro da API (o Handler global converte exceções em 500). */
    private function forbidden(string $message): JsonResponse
    {
        return response()->json(['errors' => [['description' => $message]]], 403);
    }
}
