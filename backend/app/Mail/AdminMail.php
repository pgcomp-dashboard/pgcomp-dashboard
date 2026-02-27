<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $requester,
        public string $status
    ) {}
    public function envelope(): Envelope
    {
        $subject = match ($this->status) {
            'pending'  => 'Dashboard PGCOMP - Nova solicitação de acesso admin - ' . $this->requester->name,
            // 'approved' => 'Dashboard PGCOMP - Solicitação de acesso admin aprovada',
            // 'rejected' => 'Dashboard PGCOMP - Solicitação de acesso admin rejeitada - ' . $this->requester->name,
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_request',
        );       
    }

}
