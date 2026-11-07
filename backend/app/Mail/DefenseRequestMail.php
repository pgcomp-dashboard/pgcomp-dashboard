<?php

namespace App\Mail;

use App\Domain\DefenseRequests\DefenseRequestNotifier;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Aviso de transição de uma solicitação de banca (ver DefenseRequestNotifier). */
class DefenseRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    /** @param array{type_label: string, student_name: string, title: string, actor_name: string} $request */
    public function __construct(public string $event, public array $request) {}

    public function envelope(): Envelope
    {
        $what = match ($this->event) {
            DefenseRequestNotifier::OPENED => 'nova solicitação para revisar',
            DefenseRequestNotifier::SUBMITTED => 'solicitação enviada à coordenação',
            DefenseRequestNotifier::ARCHIVED => 'solicitação arquivada',
            DefenseRequestNotifier::RESTORED => 'solicitação restaurada',
            DefenseRequestNotifier::DELETED => 'solicitação apagada',
        };

        return new Envelope(subject: "Dashboard PGCOMP - {$this->request['type_label']}: {$what}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.defense_request', with: [
            'url' => rtrim((string) config('app.front_url'), '/').'/portal/defense-requests',
        ]);
    }
}
