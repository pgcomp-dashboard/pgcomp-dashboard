<?php

namespace App\Http\Controllers\User;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Domain\DefenseRequests\DefenseRequestWorkflow;
use App\Http\Controllers\Controller;
use App\Http\Requests\DefenseRequests\StoreDefenseRequest;
use App\Http\Resources\DefenseRequestResource;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * POC: solicitação de banca (qualificação/defesa de mestrado e doutorado).
 *
 * Personas:
 * - Discente: abre a solicitação para si mesmo. Ela vai para o orientador dele
 *   (awaiting_advisor), sem as confirmações, que são declarações do orientador.
 * - Orientador (docente): revisa o que o orientando abriu, marca as confirmações e
 *   envia (submitted). Também pode abrir direto para um orientando.
 * - Coordenação (manager): vê todas em /admin, só leitura.
 *
 * Estados e transições: DefenseRequestStatus + DefenseRequestWorkflow.
 * Permissões: DefenseRequestPolicy.
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

    /** As que eu abri, as minhas como discente e as dos meus orientandos atuais. */
    public function index(Request $request)
    {
        $me = $request->user();
        $advisees = $me->advisedes()->pluck('users.id');
        $requests = DefenseRequest::with(['user', 'advisor', 'student.advisors'])
            ->where(fn ($q) => $q->where('user_id', $me->id)
                ->orWhere('advisor_user_id', $me->id)
                ->orWhere('student_user_id', $me->id)
                ->orWhereIn('student_user_id', $advisees))
            ->orderByDesc('id')
            ->get();

        return DefenseRequestResource::collection($requests);
    }

    public function store(StoreDefenseRequest $request, DefenseRequestWorkflow $workflow)
    {
        $user = $request->user();
        $type = $request->validated()['type'];
        $student = $request->student();
        // Discente: vai para o orientador do cadastro. Docente: é o orientador (conferido no request).
        $advisor = $request->isStudent() ? $student->advisors()->first() : $user;

        $defenseRequest = $workflow->open($user, $student, $advisor, $type, $this->answers($request, $type, $student, $advisor));

        return (new DefenseRequestResource($defenseRequest->load(['user', 'advisor', 'student.advisors'])))
            ->response()
            ->setStatusCode(201);
    }

    /** O orientador revisa a solicitação aberta pelo orientando, confirma e envia (policy no request). */
    public function update(StoreDefenseRequest $request, DefenseRequest $defenseRequest, DefenseRequestWorkflow $workflow)
    {
        $type = $request->validated()['type'];
        $advisor = $request->user();
        $defenseRequest = $workflow->submit($defenseRequest, $advisor, $type, $this->answers($request, $type, $defenseRequest->student, $advisor));

        return new DefenseRequestResource($defenseRequest->load(['user', 'advisor', 'student.advisors']));
    }

    /**
     * Respostas gravadas: só as chaves do schema, e o que o portal sabe vem do cadastro
     * (nome do discente, do orientador e dos docentes escolhidos), não do texto enviado.
     */
    private function answers(StoreDefenseRequest $request, string $type, ?User $student, User $advisor): array
    {
        $data = DefenseRequestForms::only($type, $request->input('data', []), withConfirmations: ! $request->isStudent());
        if ($student) {
            $data['student_name'] = $student->name;
        }
        $data['advisor'] = $advisor->name;

        $memberIds = collect($data)->map(fn ($v) => is_array($v) ? ($v['user_id'] ?? null) : null)->filter()->all();
        $professors = User::whereIn('id', $memberIds)->get()->keyBy('id');
        foreach ($data as $key => $value) {
            if (is_array($value) && ($professor = $professors->get($value['user_id'] ?? 0))) {
                $data[$key]['name'] = $professor->name;
            }
        }

        return $data;
    }
}
