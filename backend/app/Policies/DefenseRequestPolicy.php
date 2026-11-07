<?php

namespace App\Policies;

use App\Enums\DefenseRequestStatus;
use App\Enums\UserType;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Única fonte de "quem pode o quê" na solicitação de banca. O request, o Resource
 * (can_*) e o DefenseRequestWorkflow (de novo, dentro do lock) usam esta policy.
 *
 * Papéis: discente e docente abrem; a coordenação (type manager) acompanha pelo /admin,
 * que exige is_admin. Docente com is_admin continua orientador no portal.
 */
class DefenseRequestPolicy
{
    public function create(User $user): Response
    {
        return in_array($user->type, [UserType::STUDENT, UserType::PROFESSOR], true)
            ? Response::allow()
            : Response::deny('A coordenação acompanha as solicitações em Solicitações de Banca; quem abre é o discente ou o orientador.');
    }

    /** Revisar e enviar: só enquanto aguarda, e só o orientador atual do discente. */
    public function review(User $user, DefenseRequest $request): Response
    {
        if ($request->trashed()) {
            return Response::deny('Esta solicitação foi arquivada.');
        }
        if ($request->status !== DefenseRequestStatus::AWAITING_ADVISOR) {
            return Response::deny('Esta solicitação já foi enviada à coordenação.');
        }

        return self::isCurrentAdvisor($user, $request)
            ? Response::allow()
            : Response::deny('Só o orientador do discente pode revisar e enviar esta solicitação.');
    }

    /** Arquivar: quem abriu, o orientador atual ou a coordenação. */
    public function archive(User $user, DefenseRequest $request): Response
    {
        if ($request->trashed()) {
            return Response::deny('Esta solicitação já está arquivada.');
        }

        return self::isOwner($user, $request)
            ? Response::allow()
            : Response::deny('Só quem abriu, o orientador atual ou a coordenação podem arquivar esta solicitação.');
    }

    /** Restaurar: as mesmas pessoas que podem arquivar. */
    public function restore(User $user, DefenseRequest $request): Response
    {
        if (! $request->trashed()) {
            return Response::deny('Esta solicitação não está arquivada.');
        }

        return self::isOwner($user, $request)
            ? Response::allow()
            : Response::deny('Só quem abriu, o orientador atual ou a coordenação podem restaurar esta solicitação.');
    }

    /** Apagar de vez: a coordenação sempre; quem abriu, só enquanto aguarda o orientador. */
    public function forceDelete(User $user, DefenseRequest $request): Response
    {
        if ($user->is_admin) {
            return Response::allow();
        }

        return $request->user_id === $user->id && $request->status === DefenseRequestStatus::AWAITING_ADVISOR
            ? Response::allow()
            : Response::deny('Só quem abriu pode apagar, e só enquanto aguarda o orientador. Arquive em vez de apagar.');
    }

    private static function isOwner(User $user, DefenseRequest $request): bool
    {
        return $user->is_admin || $request->user_id === $user->id || self::isCurrentAdvisor($user, $request);
    }

    /**
     * O orientador vem do cadastro atual (user_user), não da cópia gravada na abertura:
     * se a secretaria trocar o orientador, o novo assume.
     */
    public static function isCurrentAdvisor(User $user, DefenseRequest $request): bool
    {
        if (! $request->student) {
            return $request->advisor_user_id === $user->id;
        }

        return $request->student->advisors->contains('id', $user->id);
    }
}
