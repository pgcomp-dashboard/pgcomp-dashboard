<?php

namespace App\Domain\Sigaa;

use App\Enums\UserType;
use App\Models\Area;
use App\Models\User;
use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Support\Str;
use QueryPath\DOMQuery;

class TeacherScraping extends BaseScraping
{
    /**
     * @var array $key: Missmatch name, $value: Correct name in the database
     */
    private const MISS_MATCH_PROFESSORS = [
        'Christina von Flach G. Chavez' => 'Christina Von Flach Garcia Chavez',
        'Claudio Nogueira Sant’Anna' => 'Claudio Nogueira Sant Anna',
    ];

    private const SIGAA_URL = 'https://sigaa.ufba.br/sigaa/public/programa/equipe.jsf';
    private const PGCOMP_AREA_URL = 'https://pgcomp.ufba.br/area-de-concentracao';

    /**
     * @var array $key: Name of the professor, $value: array with the area_id and id of the professor
     */
    private array $professorsWithArea = [];

    /**
     * Realiza o web scraping de professores no site SIGAA
     *
     * @throws Exception
     */
    public function scrapingByProgram(int $programId): array
    {

        $dom = $this->getDOMQuery(self::SIGAA_URL, ['id' => $programId]);
        $items = $dom->find('#equipePrograma table#table_lt tr')->getIterator();
        $teachers = [];
        foreach ($items as $item) {
            if ($item->hasClass('campos')) {
                continue;
            }
            $teacher = $this->extractTeacher($item);

            $teacher['area_id'] = $this->professorsWithArea[$teacher['name']]['area_id'] ?? null;

            $teachers[] = $teacher;
        }

        return $teachers;
    }

    /**
     * Extrai os dados de professor da linha da tabela HTML.
     *
     * @param DOMQuery $item
     * @return array{name: string, siape: string, relation: string, level: string, telephone: string, lattes: string, email: string}
     */
    private function extractTeacher(DOMQuery $item): array
    {
        $nameQp = $item->find('td')->eq(0);
        $name = $nameQp->text();
        $name = Str::of($name)->replace([' ', ','], '')->trim()->title()->value();

        $siapeUrl = $nameQp->find('a')->first()->attr('href');
        $siape = $this->getSiapeIdFromUrl($siapeUrl);

        $relation = $item->find('td')->eq(1)->text();
        $relation = Str::of($relation)->trim()->title()->value() ?: null;

        $level = $item->find('td')->eq(2)->text();
        $level = Str::of($level)->trim()->title()->value() ?: null;

        $telephone = $item->find('td')->eq(3)->text();
        $telephone = Str::of($telephone)->trim()->value() ?: null;

        $lattes_url = $item->find('td')
            ->eq(4)
            ->find('a')
            ->first()
            ->attr('href');
        $lattes_url = Str::of($lattes_url)->trim()->lower()->value() ?: null;

        $email = $item->find('td')
            ->eq(5)
            ->find('a')
            ->first()
            ->attr('href');
        $email = Str::of($email)->trim()->lower()->after('mailto:')->value() ?: null;

        return compact('name', 'relation', 'level', 'telephone', 'lattes_url', 'email', 'siape');
    }

    /**
     * Finds the professors with area and fills the professorsWithArea array
     * @return array
     */
    public function fillProfessorsWithArea(): array
    {

        // Access https://pgcomp.ufba.br/area-de-concentracao, get the areas
        $dom = $this->getDOMQuery(self::PGCOMP_AREA_URL);

        // Get areas after the first h1 tag with the text "Área de Concentração"
        $areas = $dom->find('.region.region-content .field-items ul > li')->getIterator();
        $professors  =[];
        foreach ($areas as $area) {
            // Get the area name. Find until the first dot ".'
            $areaName = $area->text();
            $areaName = Str::of($areaName)->before('.')->trim()->title()->value();

            $areaLink = $area->find('a')->attr('href');


            $professors = array_merge($this->getProfessors($areaName, $areaLink) ?? [], $professors);
        }
        return $professors;
    }

    /**
     * Get the professors from the area
     * @param string $areaName Name of the area
     * @param string $areaUrl URL of the area
     * @return array
     */
    private function getProfessors(string $areaName, string $areaUrl): array
    {
        $dom = $this->getDOMQuery($areaUrl);
        if ($areaName == "Engenharia De Software") {
            $html = $dom->html();
            // Convert to DOMDocument
            $dom = new DOMDocument();
            libxml_use_internal_errors(true); // Suppress HTML5 warnings
            $dom->loadHTML($html);
            libxml_clear_errors();
            $xpath = new DOMXPath($dom);
            $nodes = $xpath->query("//h3[contains(., 'Pesquisadores')]/following-sibling::ul[1]/li");
            $professors = [];
            foreach ($nodes as $node) {
                $professor = trim($node->textContent);
                if (!empty($professor)) {
                    $professors[] = $this->extractProfessorsArea($professor, $areaName);
                }
            }
            return $professors;
        }
        // Access the area link and get the professors
        $divs = $dom->find('.field-items > .field-item.even')->children('div');
        $content = $divs->eq($divs->length - 2)->text();
        $content = Str::of($content)->trim()->after('Pesquisadores:')->before('.')->value();
        $professors = explode(',', $content);
        $professors = array_map(function ($professor) use ($areaName) {
            $professor = Str::of($professor)->trim()->title()->value();
            return $this->extractProfessorsArea($professor, $areaName);
        }, $professors);
        return $professors;
    }

    /**
     * Extract and fill the professors with area
     * @param string $professorName Name of the professor
     * @param string $areaName Name of the area
     * @return array
     */
    private function extractProfessorsArea(string $professorName, string $areaName): array
    {
        if (isset(self::MISS_MATCH_PROFESSORS[$professorName])) {
            $professorName = self::MISS_MATCH_PROFESSORS[$professorName];
        }

        $names = explode(' ', $professorName);
        $user = User::where('type', UserType::PROFESSOR)
            ->where(function ($query) use ($names) {
                foreach ($names as $name) {
                    $query->where('name', 'like', "%$name%");
                }
            })
            ->first();
        if (empty($user)) {
            return [
                "name" => $professorName,
                "area_id" => null,
                "obs" => 'Nome não encontrado no banco de dados',
            ];
        }
        $user->area_id = Area::where('area', $areaName)->first()->id;
        $user->save();
        return [
            "name" => $professorName,
            "area_id" => $user->area_id,
            "obs" => 'Encontrato',
        ];
    }
}
