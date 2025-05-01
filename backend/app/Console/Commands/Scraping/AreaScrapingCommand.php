<?php

namespace App\Console\Commands\Scraping;

use App\Models\Area;

use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AreaScrapingCommand extends Command
{
    protected $signature = 'scraping:area-scraping';

    protected $description = 'Área Scraping';


    public function handle()
    {

        // Access https://pgcomp.ufba.br/area-de-concentracao, get the areas and access its link to get the subareas
        $client = new Client();
        $response = $client->request('GET', 'https://pgcomp.ufba.br/area-de-concentracao');
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
        $this->getOutput()->info('Áreas coletadas: ' . implode(', ', $areaNames));
    }
}
