<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

/**
 * Ciclo de vida da solicitação de banca (POC).
 *
 *   (nova) ──discente abre──► awaiting_advisor ──orientador envia──► submitted
 *   (nova) ──orientador abre direto───────────────────────────────► submitted
 *
 * Sem estados finais por enquanto: cancelar, devolver ao discente e a decisão do
 * colegiado dependem do professor. Para incluir, acrescente o caso e a transição.
 */
enum DefenseRequestStatus: string
{
    use EnumHelper;

    case AWAITING_ADVISOR = 'awaiting_advisor';
    case SUBMITTED = 'submitted';

    public function label(): string
    {
        return match ($this) {
            self::AWAITING_ADVISOR => 'Aguardando orientador',
            self::SUBMITTED => 'Enviada à coordenação',
        };
    }

    /** Para onde cada estado pode ir. */
    public function next(): array
    {
        return match ($this) {
            self::AWAITING_ADVISOR => [self::SUBMITTED],
            self::SUBMITTED => [],
        };
    }

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, $this->next(), true);
    }

    /** O estado já tem data de envio à coordenação. */
    public function isSubmitted(): bool
    {
        return $this === self::SUBMITTED;
    }

    /** Estados que ocupam o tipo para o discente (não pode abrir outra igual). */
    public static function inProgress(): array
    {
        return [self::AWAITING_ADVISOR, self::SUBMITTED];
    }
}
