<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfessorLattesReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $professor,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Lembrete Semestral — Mantenha seu Lattes atualizado',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.professor_lattes_reminder',
        );
    }
}
