<?php

namespace App\Console\Commands\Scraping;

use App\Models\Conference;
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

        $this->getOutput()->info('Salvadno dados...');
        $this->withProgressBar($data, function ($item) {
            print_r($item);
            try {
                if (!isset($item['Qualis 2016'])) {
                    throw new ModelNotFoundException('ERROR');
                }
                $item['Qualis 2016'] = in_array($item['Qualis 2016'], ['nulo', 'C']) ? '-' : $item['Qualis 2016'];
                $item['qualis_2016_id'] = StratumQualis::findByCode($item['Qualis 2016'], ['id'])->id;
            } catch (ModelNotFoundException) {
                $item['qualis_2016_id'] = null;
            }
            try {
                if (!isset($item['Qualis_Sem_Inducao'])) {
                    throw new ModelNotFoundException('ERROR');
                }
                $item['Qualis_Sem_Inducao'] = in_array($item['Qualis_Sem_Inducao'], ['nulo', 'C']) ?
                    '-' : $item['Qualis_Sem_Inducao'];
                $item['qualis_without_induction_id'] = StratumQualis::findByCode($item['Qualis_Sem_Inducao'], ['id'])->id;
            } catch (ModelNotFoundException) {
                $item['qualis_without_induction_id'] = null;
            }
            try {
                if (!isset($item['Qualis_Final'])) {
                    throw new ModelNotFoundException('ERROR');
                }
                $item['Qualis_Final'] = in_array($item['Qualis_Final'], ['nulo', 'C']) ?
                    '-' : $item['Qualis_Final'];
                $item['stratum_qualis_id'] = StratumQualis::findByCode($item['Qualis_Final'], ['id'])->id;
            } catch (ModelNotFoundException) {
                $item['stratum_qualis_id'] = null;
            }

            try {
                Conference::updateOrCreate(
                    [
                        'initials' => $item['sigla'],
                        'name' => $item['evento'],
                    ],
                    [
                        'last_qualis' => $item['Qualis_Final'],
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
        $client = new Client();
        $url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZsntDnttAWGHA8NZRvdvK5A_FgOAQ_tPMzP7UUf-CHwF_3PHMj_TImyXN2Q_Tmcqm2MqVknpHPoT2/pubhtml?gid=0&single=true';
        $html = $client->get($url);

        return html5qp($html->getBody()->getContents());
    }
}
