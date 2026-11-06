<?php

namespace App\Domain\DefenseRequests;

use App\Enums\DefenseRequestStatus;
use App\Enums\UserType;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Transições da solicitação de banca. Cada uma roda numa transação com lock, então
 * a conferência (status, duplicata) e a gravação não podem ser intercaladas.
 */
class DefenseRequestWorkflow
{
    /** Discente abre → aguarda o orientador; docente abre para o orientando → já enviada. */
    public function open(User $actor, User $student, User $advisor, string $type, array $data): DefenseRequest
    {
        return DB::transaction(function () use ($actor, $student, $advisor, $type, $data) {
            // Serializa as aberturas do mesmo discente (a regra de duplicata depende disso).
            User::whereKey($student->id)->lockForUpdate()->first();
            $this->assertNoOtherInProgress($student, $type);

            $submitted = $actor->type !== UserType::STUDENT;

            return DefenseRequest::create([
                'user_id' => $actor->id,
                'student_user_id' => $student->id,
                'advisor_user_id' => $advisor->id,
                'type' => $type,
                'data' => $data,
                'status' => $submitted ? DefenseRequestStatus::SUBMITTED : DefenseRequestStatus::AWAITING_ADVISOR,
                'submitted_at' => $submitted ? now() : null,
            ]);
        });
    }

    /** Orientador revisa o que o orientando abriu e envia à coordenação. */
    public function submit(DefenseRequest $request, User $advisor, string $type, array $data): DefenseRequest
    {
        return DB::transaction(function () use ($request, $advisor, $type, $data) {
            $locked = DefenseRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
            if (! $locked->status->canTransitionTo(DefenseRequestStatus::SUBMITTED)) {
                throw new DefenseRequestConflict('Esta solicitação já foi enviada à coordenação.');
            }
            if ($locked->student) {
                $this->assertNoOtherInProgress($locked->student, $type, except: $locked->id);
            }

            $locked->update([
                'type' => $type,
                'data' => $data,
                // Quem envia é o orientador atual (pode ter mudado desde a abertura).
                'advisor_user_id' => $advisor->id,
                'status' => DefenseRequestStatus::SUBMITTED,
                'submitted_at' => now(),
            ]);

            return $locked;
        });
    }

    private function assertNoOtherInProgress(User $student, string $type, ?int $except = null): void
    {
        $exists = DefenseRequest::query()
            ->where('student_user_id', $student->id)
            ->where('type', $type)
            ->whereIn('status', DefenseRequestStatus::inProgress())
            ->when($except, fn ($q) => $q->whereKeyNot($except))
            ->exists();

        if ($exists) {
            $label = DefenseRequestForms::get($type)['label'];
            throw ValidationException::withMessages(['type' => "Já existe uma solicitação de {$label} em andamento para este discente."]);
        }
    }
}
