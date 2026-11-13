<?php

namespace App\Enums;

use App\Enums\Traits\EnumHelper;

/**
 * Ciclo de vida da solicitação de banca.
 *
 *   (nova) ──discente abre──► awaiting_advisor ──orientador envia──► submitted
 *   (nova) ──orientador abre direto───────────────────────────────► submitted
 *
 * Arquivar é ortogonal ao status (soft delete, deleted_at): qualquer estado pode ser
 * arquivado e restaurado; arquivada não conta para a regra de duplicata. Apagar de vez
 * remove o registro. Não há "indeferida": quem abre sabe o que está fazendo, e um pedido
 * aberto por engano é arquivado.
 *
 * Transições e avisos (DefenseRequestWorkflow + DefenseRequestNotifier):
 *
 *   transição                 quem pode                               avisa
 *   abrir → awaiting_advisor  discente com orientador                 orientadores atuais
 *   abrir → submitted         orientador do discente                  discente + coordenação
 *   awaiting → submitted      orientador atual                        discente + coordenação
 *   arquivar / restaurar      quem abriu, orientador atual, coord.    quem abriu, discente, orientadores
 *   apagar de vez             coord.; quem abriu, se aguardando       quem abriu, discente, orientadores
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
