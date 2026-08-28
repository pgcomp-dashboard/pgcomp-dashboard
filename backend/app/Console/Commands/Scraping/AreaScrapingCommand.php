<?php

namespace App\Console\Commands\Scraping;

use App\Models\Area;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Services\ScrapingExecutionService;

class AreaScrapingCommand extends Command
{
    protected $signature = 'scraping:area-scraping';

    protected $description = 'Área Scraping';

    public function handle()
    {
        (new ScrapingExecutionService())->register('scraping:area-scraping');

        // Access https://pgcomp.ufba.br/area-de-concentracao, get the areas and access its link to get the subareas
        $client = new Client;
        try {
            $response = $client->get( 'https://pgcomp.ufba.br/area-de-concentracao', ['verify' => false]);
        } catch (GuzzleException $e) {
            Log::error('Erro ao buscar dados.', func_get_args());
            Log::error($e);
            throw new Exception('Não foi possível buscar os dados');
        }
        //$response = $client->get( 'https://pgcomp.ufba.br/area-de-concentracao');
        $html = $response->getBody()->getContents();
        $dom = html5qp($html);

        // Get areas after the first h1 tag with the text "Área de Concentração"
        $areas = $dom->find('.region.region-content .field-items ul > li')->getIterator();

        $this->getOutput()->info('Coletando dados...');
        $areaNames = [];
        foreach ($areas as $area) {
            // Get the area name. Find until the first dot ".'
            $areaName = $area->text();
            $areaName = Str::of($areaName)->before('.')->trim()->title()->value();

            Area::updateOrCreate(
                ['area' => $areaName]
            );
            $areaNames[] = $areaName;
        }
        $this->getOutput()->info('Áreas coletadas: '.implode(', ', $areaNames));
    }
}
