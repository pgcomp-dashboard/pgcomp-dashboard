<?php

namespace App\Domain\DefenseRequests;

use App\Enums\DefenseRequestStatus;
use App\Mail\DefenseRequestMail;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Closure;
use Throwable;

/**
 * E-mails das transições (a tabela fica em DefenseRequestStatus). O workflow prepara o
 * aviso dentro da transação e envia depois que ela termina: transição desfeita não avisa
 * ninguém, e falha de e-mail não desfaz a transição.
 *
 *   opened    (aguardando) → orientadores atuais do discente
 *   submitted (enviada)    → discente + coordenação (PGCOMP_COORDINATION_EMAIL)
 *   archived / restored / deleted → quem abriu, discente e orientadores atuais
 *
 * Quem fez a ação não recebe o próprio aviso.
 */
class DefenseRequestNotifier
{
    public const OPENED = 'opened';
    public const SUBMITTED = 'submitted';
    public const ARCHIVED = 'archived';
    public const RESTORED = 'restored';
    public const DELETED = 'deleted';

    /** Monta o aviso agora (destinatários e textos) e devolve quem o envia depois. */
    public function prepare(string $event, DefenseRequest $request, User $actor): Closure
    {
        // Retrato agora: em "deleted" o registro some antes do commit.
        $snapshot = [
            'type_label' => DefenseRequestForms::get($request->type)['label'] ?? $request->type,
            'student_name' => $request->student?->name ?? ($request->data['student_name'] ?? ''),
            'title' => $request->data['title'] ?? '',
            'actor_name' => $actor->name,
        ];
        $emails = $this->recipients($event, $request, $actor);

        return function () use ($event, $snapshot, $emails) {
            foreach ($emails as $email) {
                try {
                    Mail::to($email)->send(new DefenseRequestMail($event, $snapshot));
                } catch (Throwable $e) {
                    Log::warning("Aviso de solicitação de banca não enviado ({$event}) para {$email}: {$e->getMessage()}");
                }
            }
        };
    }

    /** @return list<string> */
    public function recipients(string $event, DefenseRequest $request, User $actor): array
    {
        $student = $request->student;
        $advisors = $student ? $student->advisors()->get() : collect();
        $people = match ($event) {
            self::OPENED => $request->status === DefenseRequestStatus::AWAITING_ADVISOR ? $advisors : collect([$student]),
            self::SUBMITTED => collect([$student]),
            default => collect([$request->user, $student])->concat($advisors),
        };

        $emails = $people->filter()->reject(fn (User $u) => $u->id === $actor->id)->pluck('email');
        $opensSubmitted = $event === self::OPENED && $request->status === DefenseRequestStatus::SUBMITTED;
        if (($event === self::SUBMITTED || $opensSubmitted) && ($coordination = config('services.pgcomp.coordination_email'))) {
            $emails->push($coordination);
        }

        return $emails->filter()->unique()->values()->all();
    }
}
