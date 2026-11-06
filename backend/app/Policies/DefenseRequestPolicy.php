<?php

namespace App\Policies;

use App\Enums\DefenseRequestStatus;
use App\Enums\UserType;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Única fonte de "quem pode o quê" na solicitação de banca (request, controller e
 * o can_review do Resource usam esta policy).
 *
 * Papéis: discente e docente abrem; a coordenação (type manager) só acompanha pelo
 * /admin, que exige is_admin. Docente com is_admin continua orientador no portal.
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
        if ($request->status !== DefenseRequestStatus::AWAITING_ADVISOR) {
            return Response::deny('Esta solicitação já foi enviada à coordenação.');
        }

        return self::isCurrentAdvisor($user, $request)
            ? Response::allow()
            : Response::deny('Só o orientador do discente pode revisar e enviar esta solicitação.');
    }

    /**
     * O orientador vem do cadastro atual (user_user), não da cópia gravada na abertura:
     * se a secretaria trocar o orientador, ou o antigo for removido, o novo assume.
     */
    public static function isCurrentAdvisor(User $user, DefenseRequest $request): bool
    {
        if (! $request->student) {
            return $request->advisor_user_id === $user->id;
        }

        return $request->student->advisors->contains('id', $user->id);
    }
}
