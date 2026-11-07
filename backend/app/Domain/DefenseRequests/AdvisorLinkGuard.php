<?php

namespace App\Domain\DefenseRequests;

use App\Enums\DefenseRequestStatus;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Nenhuma solicitação aguardando pode ficar sem orientador: para remover o último
 * orientador de um discente com pedido aguardando, vincule outro antes.
 *
 * Chame dentro da transação que muda os vínculos: as funções travam a linha do
 * discente, a mesma que o DefenseRequestWorkflow trava, então a conferência e a
 * mudança não se intercalam com uma abertura ou um envio.
 */
class AdvisorLinkGuard
{
    /** O discente vai ficar só com estes orientadores. */
    public static function assertStudentKeepsAdvisor(User $student, array $remainingAdvisorIds): void
    {
        User::whereKey($student->id)->lockForUpdate()->first();
        if ($remainingAdvisorIds === [] && self::hasAwaiting($student->id)) {
            throw ValidationException::withMessages(['advisor_id' => self::message($student)]);
        }
    }

    /** O docente vai deixar de orientar todos os orientandos (ex.: exclusão do cadastro). */
    public static function assertProfessorCanLeave(User $professor): void
    {
        foreach ($professor->advisedes()->get() as $student) {
            User::whereKey($student->id)->lockForUpdate()->first();
            $others = $student->advisors()->whereKeyNot($professor->id)->exists();
            if (! $others && self::hasAwaiting($student->id)) {
                throw ValidationException::withMessages(['advisor_id' => self::message($student)]);
            }
        }
    }

    private static function hasAwaiting(int $studentId): bool
    {
        return DefenseRequest::where('student_user_id', $studentId)
            ->where('status', DefenseRequestStatus::AWAITING_ADVISOR)
            ->exists();
    }

    private static function message(User $student): string
    {
        return "{$student->name} tem solicitação de banca aguardando o orientador. Vincule outro orientador antes de remover este.";
    }
}
