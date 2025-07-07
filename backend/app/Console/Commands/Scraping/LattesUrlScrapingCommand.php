<?php

namespace App\Console\Commands\Scraping;

use DOMElement;
use Exception;
use Illuminate\Console\Command;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use QueryPath\DOMQuery;
use App\Models\User;

class LattesUrlScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:lattes-url-scraping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get the lattes urls of the professors';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dom = $this->getDOMQuery('https://pgcomp.ufba.br/corpo-docente');

        $data = [
            // The website has three tables
            ...$this->processTable($dom, 1),
            ...$this->processTable($dom, 2),
            ...$this->processTable($dom, 3),
        ];

        foreach ($data as $item) {
            /** @var array{name: string, lattes: string} $item */

            $professor = User::where('name', $item["name"])->first();

            if ($professor) {
                $professor->lattes_url = $item["lattes"];
                $professor->save();
                $this->info("Updated " . $professor->name . " -> " . $professor->lattes_url);
            }
        }
    }

    private function processTable(DOMQuery $dom, int $nth = 1) {
        $items = $dom->find('div.table-responsive:nth-child(' . $nth . ') > table:nth-child(1) > tbody > tr')->getIterator();

        $data = [];

        foreach ($items as $item) {
            /** @var DOMQuery $item */
            $data[] = $this->getLattesFromTableRow($item);
        }

        return $data;
    }

    private function getLattesFromTableRow(DOMQuery $tr) {
        /** @var Array<DOMElement> $children */
        $children = $tr->children()->toArray();

        $name = $children[0]->textContent;
        $lattes = $children[2]->getElementsByTagName("a")[0]->getAttribute('href');

        return [
            'name' => trim(str_replace(
                ["\r\n", "\r", "\n", "\t"],
                "",
                $name
            )),
            'lattes' => $lattes,
        ];
    }

    private function getDOMQuery(string $url, array $queryParams = []): DOMQuery
    {
        $httpClient = new Client;
        try {
            $response = $httpClient->get($url, ['query' => $queryParams]);
        } catch (GuzzleException $e) {
            Log::error('Erro ao buscar dados.', func_get_args());
            Log::error($e);
            throw new Exception('Não foi possível buscar os dados');
        }
        $html = $response->getBody()->getContents();

        return html5qp($html);
    }
}
