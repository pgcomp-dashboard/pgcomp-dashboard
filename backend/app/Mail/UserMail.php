<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $requester,
        public string $status
    ) {}
    public function envelope(): Envelope
    {
        $subject = match ($this->status) {
            'pending'  => 'Dashboard PGCOMP - Solicitação de acesso admin pendente',
            'approved' => 'Dashboard PGCOMP - Solicitação de acesso admin aprovada',
            'rejected' => 'Dashboard PGCOMP - Solicitação de acesso admin rejeitada'
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user_request',
        );
    }

}
