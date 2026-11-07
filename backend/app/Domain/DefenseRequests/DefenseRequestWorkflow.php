<?php

namespace App\Domain\DefenseRequests;

use App\Enums\DefenseRequestStatus;
use App\Enums\UserType;
use App\Models\DefenseRequest;
use App\Models\User;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/**
 * Transições da solicitação de banca. Cada uma roda numa transação que trava primeiro a
 * linha do discente (a mesma que a secretaria trava ao mudar vínculos, ver AdvisorLinkGuard)
 * e depois a da solicitação. Dentro do lock a policy e as regras são conferidas de novo:
 * o que o FormRequest viu antes pode ter mudado. Verificado em _local/formal (TLA+, Fixed).
 */
class DefenseRequestWorkflow
{
    public function __construct(private DefenseRequestNotifier $notifier) {}

    /**
     * Discente abre → aguarda o orientador; docente abre para o orientando → já enviada.
     *
     * @param  Closure(User $advisor): array  $answers  monta as respostas com o orientador resolvido aqui dentro
     */
    public function open(User $actor, User $student, string $type, Closure $answers, array $rawData): DefenseRequest
    {
        return $this->run(function (Closure $notify) use ($actor, $student, $type, $answers, $rawData) {
            $student = $this->lockStudent($student->id);
            DefenseRequestRules::assert(DefenseRequestRules::forOpen($actor, $student, $type, $rawData));
            $this->assertNoOtherInProgress($student, $type);

            $submitted = $actor->type !== UserType::STUDENT;
            // Discente: o orientador atual do cadastro, lido dentro do lock (nunca nulo: a regra acima garante).
            $advisor = $submitted ? $actor : $student->advisors()->orderBy('users.id')->firstOrFail();

            $request = DefenseRequest::create([
                'user_id' => $actor->id,
                'student_user_id' => $student->id,
                'advisor_user_id' => $advisor->id,
                'type' => $type,
                'data' => $answers($advisor),
                'schema_version' => DefenseRequestForms::VERSION,
                'status' => $submitted ? DefenseRequestStatus::SUBMITTED : DefenseRequestStatus::AWAITING_ADVISOR,
                'submitted_at' => $submitted ? now() : null,
            ]);
            // Docente que abre direto já envia: o aviso é o de "enviada", não o de "para revisar".
            $notify($submitted ? DefenseRequestNotifier::SUBMITTED : DefenseRequestNotifier::OPENED, $request, $actor);

            return $request;
        });
    }

    /** Orientador atual revisa o que o orientando abriu e envia à coordenação. */
    public function submit(DefenseRequest $request, User $advisor, string $type, Closure $answers, array $rawData): DefenseRequest
    {
        return $this->run(function (Closure $notify) use ($request, $advisor, $type, $answers, $rawData) {
            [$student, $locked] = $this->lock($request);
            if (! $locked->status->canTransitionTo(DefenseRequestStatus::SUBMITTED)) {
                throw new DefenseRequestConflict('Esta solicitação já foi enviada à coordenação.');
            }
            $this->authorize($advisor, 'review', $locked);
            if ($student) {
                DefenseRequestRules::assert(DefenseRequestRules::forReview($student, $type, $rawData));
                $this->assertNoOtherInProgress($student, $type, except: $locked->id);
            }

            $locked->update([
                'type' => $type,
                'data' => $answers($advisor),
                'schema_version' => DefenseRequestForms::VERSION,
                'advisor_user_id' => $advisor->id,
                'status' => DefenseRequestStatus::SUBMITTED,
                'submitted_at' => now(),
            ]);
            $notify(DefenseRequestNotifier::SUBMITTED, $locked, $advisor);

            return $locked;
        });
    }

    /** Arquivar (soft delete): sai da lista e da regra de duplicata; pode ser restaurada. */
    public function archive(DefenseRequest $request, User $actor): DefenseRequest
    {
        return $this->run(function (Closure $notify) use ($request, $actor) {
            [, $locked] = $this->lock($request);
            $this->authorize($actor, 'archive', $locked);
            $locked->update(['archived_by_user_id' => $actor->id]);
            $locked->delete();
            $notify(DefenseRequestNotifier::ARCHIVED, $locked, $actor);

            return $locked;
        });
    }

    /**
     * Restaurar: volta como estava, se não houver outra do mesmo tipo em andamento e, se
     * ainda aguarda o orientador, se o discente tiver orientador (a trava do último
     * orientador não olha arquivadas; o TLA+ achou o caminho arquivar → desvincular → restaurar).
     */
    public function restore(DefenseRequest $request, User $actor): DefenseRequest
    {
        return $this->run(function (Closure $notify) use ($request, $actor) {
            [$student, $locked] = $this->lock($request);
            $this->authorize($actor, 'restore', $locked);
            if ($student) {
                $this->assertNoOtherInProgress($student, $locked->type, except: $locked->id, restoring: true);
                if ($locked->status === DefenseRequestStatus::AWAITING_ADVISOR && ! $student->advisors()->exists()) {
                    throw ValidationException::withMessages(['advisor_id' => "{$student->name} está sem orientador vinculado. Peça à secretaria para vincular antes de restaurar esta solicitação."]);
                }
            }
            $locked->archived_by_user_id = null;
            $locked->restore();
            $notify(DefenseRequestNotifier::RESTORED, $locked, $actor);

            return $locked;
        });
    }

    /** Apagar de vez (sem volta). */
    public function destroy(DefenseRequest $request, User $actor): void
    {
        $this->run(function (Closure $notify) use ($request, $actor) {
            [, $locked] = $this->lock($request);
            $this->authorize($actor, 'forceDelete', $locked);
            $notify(DefenseRequestNotifier::DELETED, $locked, $actor);
            $locked->forceDelete();
        });
    }

    // ---- apoio ------------------------------------------------------------------

    /**
     * Roda a transição numa transação; o aviso preparado lá dentro (via $notify) só é
     * enviado se ela terminar sem erro.
     */
    private function run(Closure $transition): mixed
    {
        $pending = null;
        // Closure normal (não arrow fn): $pending precisa ser a mesma variável lá dentro.
        $result = DB::transaction(function () use ($transition, &$pending) {
            return $transition(function (string $event, DefenseRequest $request, User $actor) use (&$pending) {
                $pending = $this->notifier->prepare($event, $request, $actor);
            });
        });
        $pending?->__invoke();

        return $result;
    }

    private function lockStudent(int $id): User
    {
        return User::whereKey($id)->lockForUpdate()->firstOrFail();
    }

    /** Discente primeiro, solicitação depois (mesma ordem em todas as transições: sem deadlock). */
    private function lock(DefenseRequest $request): array
    {
        $student = $request->student_user_id ? $this->lockStudent($request->student_user_id) : null;
        $locked = DefenseRequest::withTrashed()->whereKey($request->id)->lockForUpdate()->first();
        if (! $locked) {
            throw new DefenseRequestConflict('Esta solicitação foi apagada.');
        }

        return [$student, $locked];
    }

    private function authorize(User $user, string $ability, DefenseRequest $request): void
    {
        $response = Gate::forUser($user)->inspect($ability, $request);
        if ($response->denied()) {
            throw new DefenseRequestDenied($response->message() ?: 'Você não pode fazer isso nesta solicitação.');
        }
    }

    private function assertNoOtherInProgress(User $student, string $type, ?int $except = null, bool $restoring = false): void
    {
        // Arquivadas ficam de fora (SoftDeletes).
        $exists = DefenseRequest::query()
            ->where('student_user_id', $student->id)
            ->where('type', $type)
            ->whereIn('status', DefenseRequestStatus::inProgress())
            ->when($except, fn ($q) => $q->whereKeyNot($except))
            ->exists();

        if ($exists) {
            $label = DefenseRequestForms::get($type)['label'];
            $message = $restoring
                ? "Já existe outra solicitação de {$label} em andamento para este discente. Arquive aquela antes de restaurar esta."
                : "Já existe uma solicitação de {$label} em andamento para este discente.";

            throw ValidationException::withMessages(['type' => $message]);
        }
    }
}
