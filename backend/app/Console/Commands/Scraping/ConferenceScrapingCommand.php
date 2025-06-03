<?php

namespace App\Console\Commands\Scraping;

use App\Enums\PublisherType;
use App\Models\Publishers;
use App\Models\StratumQualis;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use QueryPath\DOMQuery;

class ConferenceScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:qualis-conference-scraping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extrai dados da planilha [CONFERENCIAS]_PlanilhaNovoQualis-ScriptPython : Qualis';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->getOutput()->info('Coletando dados...');
        $dom = $this->getDomQuery();
        $table = $dom->find('table')->first();

        $header = [];
        $ths = $dom->find('table tbody tr')->first()->find('td');
        foreach ($ths->getIterator() as $th) {
            $header[] = Str::of($th->text())->trim()->value();
        }

        /** @var \QueryPath\QueryPathIterator $rows */
        $rows = $table->find('tr')->getIterator();
        $rows->next(); // header
        $rows->next(); // blank line

        $data = [];
        foreach ($rows as $row) {
            $item = [];
            $columns = $row->find('td')->getIterator();
            foreach ($columns as $index => $column) {
                $item[$header[$index]] = Str::of($column->text())->trim()->value();
            }
            $data[] = $item;
        }

        $data = array_filter($data);
        array_shift($data); // remove header.
        array_shift($data); // remove blank line.

        $this->getOutput()->info('Salvando dados...');
        $this->withProgressBar($data, function ($item) {
            try {
                if (! isset($item['Qualis_Final'])) {
                    throw new ModelNotFoundException('ERROR');
                }

                $stratumQualisId = StratumQualis::findByCode($item['Qualis_Final'], ['id'])->id;
            } catch (ModelNotFoundException) {
                $stratumQualisId = null;
            }
            try {
                Publishers::updateOrCreate(
                    [
                        'initials' => $item['sigla'],
                        'name' => $item['evento'],
                    ],
                    [
                        'initials' => (string) $item['sigla'],
                        'name' => $item['evento'],
                        'publisher_type' => PublisherType::CONFERENCE->value,
                        'stratum_qualis_id' => $stratumQualisId,
                    ]
                );
            } catch (ValidationException $exception) {
                $this->getOutput()->error($exception->getMessage());
                $this->getOutput()->note(json_encode($item));
            }
        });

        $this->getOutput()->info('Dados atualizados com sucesso.');

        return 0;
    }

    /**
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    protected function getDomQuery(): DOMQuery
    {
        $client = new Client;
        $url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZsntDnttAWGHA8NZRvdvK5A_FgOAQ_tPMzP7UUf-CHwF_3PHMj_TImyXN2Q_Tmcqm2MqVknpHPoT2/pubhtml?gid=0&single=true';
        $html = $client->get($url);

        return html5qp($html->getBody()->getContents());
    }
}
