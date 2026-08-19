<?php

namespace App\Console\Commands;

use App\Models\Publishers;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteUnusedPublishersCommand extends Command
{
    protected $signature = 'publishers:delete-unused';
    protected $description = 'Deleta publishers pendentes sem produções correspondentes';

    public function handle()
    {
        $this->info('Buscando publishers pendentes sem produções...');

        $query = Publishers::onlyPending()->whereDoesntHave('productions');
        $total = $query->count();

        if ($total === 0) {
            $this->info('Nenhum publisher pendente sem produções encontrado.');
            return 0;
        }

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $deletedCount = 0;

        // Processa em lotes para evitar estouro de memória
        $query->chunkById(100, function ($publishers) use (&$deletedCount, $bar) {
            DB::transaction(function () use ($publishers, &$deletedCount, $bar) {
                foreach ($publishers as $publisher) {
                    // Remove ISSNs relacionados antes de deletar o publisher (se não houver cascade no banco)
                    $publisher->issns()->delete();
                    $publisher->delete();

                    $deletedCount++;
                    $bar->advance();
                }
            });
        });

        $bar->finish();
        $this->newLine(2);
        $this->info("Concluído! Total de publishers deletados: {$deletedCount}");

        return 0;
    }
}
