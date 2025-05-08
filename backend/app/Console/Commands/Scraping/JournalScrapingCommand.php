<?php

namespace App\Console\Commands\Scraping;

use App\Models\Journal;
use App\Models\Publishers;
use App\Models\StratumQualis;
use Carbon\Exceptions\InvalidFormatException;
use Google\Client;
use Google\Service\Sheets;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class JournalScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:qualis-journal-scraping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extrai dados da planilha [PERIÓDICOS]_PlanilhaNovoQualis-ScriptPython';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $data = $this->getSheet();

        $this->getOutput()->info('Ajustando dados...');

        $this->getOutput()->info('Salvando dados...');
        $this->withProgressBar($data, function ($item) {
            $item['Qualis_Final'] = in_array($item['Qualis_Final'], ['nulo', 'C']) ? '-' : $item['Qualis_Final'];
            Publishers::updateOrCreate(
                [
                    'issn' => Str::of($item['issn'])->replace('-', '')->upper()->value(),
                ],
                [
                    'name' => $item['periodico'],
                    'sbc_adjustment' => in_array($item['Ajuste_SBC'], ['nulo']) ? null : $item['Ajuste_SBC'],
                    'scopus_url' => in_array($item['link_scopus'], ['nulo']) ? null : $item['link_scopus'],
                    'percentile' => in_array($item['percentil'], ['nulo']) ? null : $item['percentil'],
                    'last_qualis' => $item['Qualis_Final'],
                    'update_date' => $this->stringToDate($item['data-atualizacao']),
                    'tentative_date' => $this->stringToDate($item['data-tentativa']),
                    'logs' => $item['logs'],
                    'publisher_type'=>'journal',
                    'issn' => Str::of($item['issn'])->replace('-', '')->upper()->value(),
                    'stratum_qualis_id' => StratumQualis::findOrCreateBycode($item['Qualis_Final'] )->id,
                ]
            );
        });

        $this->getOutput()->info('Dados salvos com sucesso.');
        return 0;
    }

    protected function stringToDate(string $date): ?Carbon
    {
        try {
            $date = Carbon::createFromFormat('d/m/Y H:i:s', $date);
            if ($date instanceof Carbon) {
                return $date;
            }
        } catch (InvalidFormatException) {
        }

        return null;
    }


    protected function getSheet(): Collection {
        // Fetch and parse the CSV
        $csvString = file_get_contents("https://docs.google.com/spreadsheets/d/10sObNyyL7veHGFbOyizxM8oVsppQoWV-0ALrDr8FxQ0/export?format=csv");

        $lines = array_filter(explode(PHP_EOL, $csvString));

        // Parse each line into an array
        $rows = array_map('str_getcsv', $lines);

        // Extract header
        $headers = array_shift($rows);

        // Create collection with header as keys
        $collection = collect($rows)->map(function ($row) use ($headers) {
            return array_combine($headers, $row);
        });

        return $collection;
    }
}
