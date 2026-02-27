<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $requester,
        public string $status
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->status) {
            'new_registration' => 'Dashboard PGCOMP - Novo cadastro pendente - ' . $this->requester->name,
            'approved'         => 'Dashboard PGCOMP - Cadastro aprovado!',
            'rejected'         => 'Dashboard PGCOMP - Cadastro rejeitado',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.registration');
    }
}
