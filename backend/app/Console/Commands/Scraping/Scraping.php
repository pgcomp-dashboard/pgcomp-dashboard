<?php

namespace App\Console\Commands\Scraping;

use Exception;
use Illuminate\Console\Command;

class Scraping extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:run {class?*}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run scraping commands';

    protected string $baseNamespace = 'App\Console\Commands\Scraping\\';


    /**
     * Execute the console command.
     */
    public function handle()
    {
        $classes = $this->argument('class');
        if (empty($classes)) {
            // load all classes from the scraping directory
            $classes = [
                'AreaSubareaScrapingCommand',
                'SigaaScrapingCommand',
                'ConferenceScrapingCommand',
                'JournalScrapingCommand'
            ];
        }

        foreach ($classes as $class) {
            $class = $this->baseNamespace . $class;
            if (!class_exists($class)) {
                $this->error("Classe de scraping {$class} não existe.");
                continue;
            }

            try {
                $this->call($class);
            } catch (Exception $e) {
                $this->error("Erro ao executar {$class}: " . $e->getMessage());
            }
        }

        return 0;
    }
}
