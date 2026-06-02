<?php

namespace App\Console\Commands\Mail;

use App\Enums\UserCategory;
use App\Mail\ProfessorAccreditationMail;
use App\Services\Admin\AccreditationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendAccreditationWarningEmail extends Command
{
    protected $signature = 'mail:send-accreditation-warning';
    protected $description = 'Envia e-mail de alerta de credenciamento para docentes permanentes em risco';

    public function handle(AccreditationService $accreditationService): int
    {
        $currentYear = now()->year;
        $year1 = $currentYear - 4;
        $year2 = $currentYear - 1;

        $ranking = $accreditationService->getAccreditationRanking($year1, $year2);

        $atRisk = $ranking->filter(
            fn($prof) => $prof->category === UserCategory::PERMANENTE->value
                && $prof->is_accredited === false
                && ! empty($prof->email)
        );

        foreach ($atRisk as $prof) {
            Mail::to($prof->email)->send(
                new ProfessorAccreditationMail($prof, $prof->reasons, $year1, $year2)
            );
            $this->info("E-mail enviado para: {$prof->name} ({$prof->email})");
        }

        $this->info("Total: {$atRisk->count()} e-mail(s) enviado(s).");

        return 0;
    }
}