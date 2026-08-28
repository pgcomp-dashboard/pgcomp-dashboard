<?php

namespace App\Console\Commands\Mail;

use App\Enums\UserCategory;
use App\Mail\ProfessorLattesReminderMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendLattesReminderEmail extends Command
{
    protected $signature = 'mail:send-lattes-reminder';
    protected $description = 'Envia lembrete semestral para docentes permanentes atualizarem o Lattes';

    public function handle(): int
    {
        $professors = User::professors()
            ->where('category', UserCategory::PERMANENTE)
            ->whereNotNull('email')
            ->get();

        foreach ($professors as $prof) {
            Mail::to($prof->email)->send(new ProfessorLattesReminderMail($prof));
            $this->info("E-mail enviado para: {$prof->name} ({$prof->email})");
        }

        $this->info("Total: {$professors->count()} e-mail(s) enviado(s).");

        return 0;
    }
}