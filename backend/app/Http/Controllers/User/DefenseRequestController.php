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
 * Solicitação de banca (qualificação/defesa de mestrado e doutorado) no portal.
 *
 * Personas:
 * - Discente: abre a solicitação para si mesmo. Ela vai para o orientador dele
 *   (awaiting_advisor), sem as confirmações, que são declarações do orientador.
 * - Orientador (docente): revisa o que o orientando abriu, marca as confirmações e
 *   envia (submitted). Também pode abrir direto para um orientando.
 * - Coordenação (is_admin): acompanha em /admin (Admin\DefenseRequestController).
 *
 * Quem abriu e o orientador atual também arquivam e restauram; quem abriu apaga de vez
 * enquanto aguarda o orientador. Estados e transições: DefenseRequestStatus + DefenseRequestWorkflow.
 */
class DefenseRequestController extends Controller
{
    public function __construct(private DefenseRequestWorkflow $workflow) {}

    public function forms()
    {
        return response()->json([
            'data' => collect(DefenseRequestForms::all())
                ->map(fn ($form, $type) => ['type' => $type] + DefenseRequestForms::TYPE_MATRIX[$type] + $form)
                ->values(),
        ]);
    }

    /** As minhas (abri ou sou o discente) e as dos meus orientandos atuais. ?archived=1 = arquivadas. */
    public function index(Request $request)
    {
        $me = $request->user();
        $advisees = $me->advisedes()->pluck('users.id');
        $requests = DefenseRequest::with(['user', 'advisor', 'archivedBy', 'student.advisors'])
            ->when($request->boolean('archived'), fn ($q) => $q->onlyTrashed())
            ->where(fn ($q) => $q->where('user_id', $me->id)
                ->orWhere('student_user_id', $me->id)
                ->orWhereIn('student_user_id', $advisees))
            ->orderByDesc('id')
            ->get();

        return DefenseRequestResource::collection($requests);
    }

    public function store(StoreDefenseRequest $request)
    {
        $type = $request->validated()['type'];
        $student = $request->student();
        $defenseRequest = $this->workflow->open(
            $request->user(), $student, $type,
            fn (User $advisor) => $this->answers($request, $type, $student, $advisor),
            (array) $request->input('data', []),
        );

        return (new DefenseRequestResource($this->loaded($defenseRequest)))->response()->setStatusCode(201);
    }

    public function update(StoreDefenseRequest $request, DefenseRequest $defenseRequest)
    {
        $type = $request->validated()['type'];
        $defenseRequest = $this->workflow->submit(
            $defenseRequest, $request->user(), $type,
            fn (User $advisor) => $this->answers($request, $type, $defenseRequest->student, $advisor),
            (array) $request->input('data', []),
        );

        return new DefenseRequestResource($this->loaded($defenseRequest));
    }

    /** DELETE: arquiva (soft delete). */
    public function destroy(Request $request, DefenseRequest $defenseRequest)
    {
        return new DefenseRequestResource($this->loaded($this->workflow->archive($defenseRequest, $request->user())));
    }

    public function restore(Request $request, DefenseRequest $defenseRequest)
    {
        return new DefenseRequestResource($this->loaded($this->workflow->restore($defenseRequest, $request->user())));
    }

    public function forceDestroy(Request $request, DefenseRequest $defenseRequest)
    {
        $this->workflow->destroy($defenseRequest, $request->user());

        return response()->noContent();
    }

    private function loaded(DefenseRequest $request): DefenseRequest
    {
        return $request->load(['user', 'advisor', 'archivedBy', 'student.advisors']);
    }

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
