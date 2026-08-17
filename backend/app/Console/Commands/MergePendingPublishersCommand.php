<?php

namespace App\Console\Commands;

use App\Models\Publishers;
use App\Models\Production;
use App\Services\PublisherService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MergePendingPublishersCommand extends Command
{
    protected $signature = 'publishers:merge-pending';
    protected $description = 'Busca publishers de conferência pendentes, encontra o correspondente aprovado e migra as productions preenchendo o original_publisher_id';

    public function handle(PublisherService $publisherService)
    {
        $this->info('Iniciando a busca por publishers de conferência pendentes...');
        $pendingPublishers = Publishers::onlyPending()->onlyConferences()->get();

        if ($pendingPublishers->isEmpty()) {
            $this->info('Nenhum publisher pendente encontrado.');
            return 0;
        }

        $bar = $this->output->createProgressBar($pendingPublishers->count());
        $bar->start();

        $migratedCount = 0;

        foreach ($pendingPublishers as $pending) {

            $approvedPublisher = $publisherService->findPublisherByConferenceName($pending->name, true);

            if ($approvedPublisher && $approvedPublisher->id !== $pending->id) {

                DB::transaction(function () use ($pending, $approvedPublisher) {
                    // Atualiza as productions ligadas ao pendente, movendo para o aprovado
                    Production::where('publisher_id', $pending->id)->update([
                        'publisher_id' => $approvedPublisher->id
                    ]);

                    // $pending->delete();
                });

                $migratedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Processo concluído! Total de publishers pendentes mesclados com sucesso: {$migratedCount}");

        return 0;
    }
}
