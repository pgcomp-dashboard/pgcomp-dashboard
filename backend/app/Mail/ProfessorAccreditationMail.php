<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfessorAccreditationMail extends Mailable{
    use Queueable, SerializesModels;

    public function __construct(
        public User $professor,
        public array $reasons,
        public int $year1,
        public int $year2
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Alerta de Credenciamento PGCOMP - ' . now()->year);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.professor_accreditation_warning',
        );       
    }

}
