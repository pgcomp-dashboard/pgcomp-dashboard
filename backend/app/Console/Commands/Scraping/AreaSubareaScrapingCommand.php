<?php

namespace App\Console\Commands\Scraping;

use App\Models\Area;

use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AreaSubareaScrapingCommand extends Command
{
    protected $signature = 'scraping:area-subarea-scraping';

    protected $description = 'Área Sub-area';


    public function handle()
    {

        // Access https://pgcomp.ufba.br/area-de-concentracao, get the areas and access its link to get the subareas
        $client = new Client();
        $response = $client->request('GET', 'https://pgcomp.ufba.br/area-de-concentracao');
        $html = $response->getBody()->getContents();
        $dom = html5qp($html);

        // Get areas after the first h1 tag with the text "Área de Concentração"
        $areas = $dom->find('.region.region-content .field-items ul > li')->getIterator();

        foreach ($areas as $area) {
            // Get the area name. Find until the first dot ".'
            $areaName = $area->text();
            $areaName = Str::of($areaName)->before('.')->trim()->title()->value();

            $areaLink = $area->find('a')->attr('href');

            $this->generateSubArea($areaName, $areaLink);
        }
    }

    private function generateSubArea(string $areaName, string $areaUrl): void
    {

        $this->info("\nAcessando a área: $areaName");
        $subAreas = $this->getSubAreas($areaName, $areaUrl);
        $rows = [];
        foreach ($subAreas as $subAreaName) {
            $area = Area::updateOrCreate(
                ['area' => $areaName, 'subarea' => $subAreaName]
            );
            $rows[] = [$area->id, $area->area, $area->subarea, $area->wasRecentlyCreated ? 'Sim' : 'Não'];
        }
        $this->table(
            ['ID', 'Área', 'Subárea', 'Criada'],
            $rows
        );
    }

    private function getSubAreas(string $areaName, string $areaUrl): array
    {
        // "Engenharia de Software" is a special case. PGCOMP site does not have an explicit subarea for it.
        if ($areaName == "Engenharia De Software") {
            return  [
                "Engenharia de Software"
            ];
        }

        // Access the area link and get the subareas
        $client = new Client();
        $response = $client->request('GET', $areaUrl);
        $html = $response->getBody()->getContents();
        $dom = html5qp($html);
        $subAreasIterator = $dom->find('.region.region-content .field-items ul > li')->getIterator();

        foreach ($subAreasIterator as $subArea) {
            // Get the subarea name. Find until the first dot ".'
            $subAreaName = $subArea->text();
            $subAreaName = Str::of($subAreaName)->before('.')->trim()->title()->value();
            $subAreas[] = $subAreaName;
        }
        return $subAreas;
    }
}
