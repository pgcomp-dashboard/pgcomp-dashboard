<?php

namespace App\Console\Commands;

use App\Models\Journal;
use App\Models\StratumQualis;
use Carbon\Exceptions\InvalidFormatException;
use Google\Client;
use Google\Service\Sheets;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Carbon;

class JournalScraping extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qualis:journal-scraping';

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
        $sheet = $this->getSheet();

        $this->getOutput()->info('Buscando dados...');
        // [PERIÓDICOS]_PlanilhaNovoQualis-ScriptPython
        $values = $sheet->spreadsheets_values
            ->get('10sObNyyL7veHGFbOyizxM8oVsppQoWV-0ALrDr8FxQ0', 'A:I')
            ->values;

        $this->getOutput()->info('Ajustando dados...');
        $header = collect(array_shift($values));
        $data = collect($values)->transform(fn($item) => $header->combine($item)->all());

        $this->getOutput()->info('Salvando dados...');
        $this->withProgressBar($data, function ($item) {
            try {
                $item['stratum_qualis_id'] = StratumQualis::findByCode($item['Qualis_Final'], ['id'])->id;
            } catch (ModelNotFoundException) {
                $item['stratum_qualis_id'] = null;
            }
            Journal::updateOrCreate(
                [
                    'issn' => $item['issn'],
                ],
                [
                    'name' => $item['periodico'],
                    'sbc_adjustment' => $item['Ajuste_SBC'],
                    'scopus_url' => $item['link_scopus'],
                    'percentile' => $item['percentil'],
                    'last_qualis' => $item['Qualis_Final'],
                    'update_date' => $this->stringToDate($item['data-atualizacao']),
                    'tentative_date' => $this->stringToDate($item['data-tentativa']),
                    'logs' => $item['logs'],
                    'stratum_qualis_id' => $item['stratum_qualis_id'],
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

    protected function getSheet(): Sheets
    {
        $cliente = new Client();
        $cliente->setAuthConfig('/var/www/html/google-ufba.json');

        $cliente->setApplicationName('mate85-sheets');
        $cliente->addScope(Sheets::SPREADSHEETS_READONLY);

        return new Sheets($cliente);
    }
}
