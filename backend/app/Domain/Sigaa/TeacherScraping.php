<?php

namespace App\Domain\Sigaa;

use Exception;
use Illuminate\Support\Str;
use QueryPath\DOMQuery;

class TeacherScraping extends BaseScraping
{
    /**
     * @throws Exception
     */
    public function scrapingByCourse(int $courseId): array
    {
        $dom = $this->getDOMQuery('https://sigaa.ufba.br/sigaa/public/programa/equipe.jsf', ['id' => $courseId]);
        $items = $dom->find('div#listagem_tabela table#table_lt tr')->getIterator();
        $teachers = [];
        foreach ($items as $item) {
            if ($item->hasClass('campos')) {
                continue;
            }
            $teachers[] = $this->extractTeacher($item);
        }

        return $teachers;
    }

    /**
     * @param DOMQuery $item
     * @return array{name: string, siape: string, relation: string, level: string, telephone: string, lattes: string, email: string}
     */
    private function extractTeacher(DOMQuery $item): array
    {
        $nameQp = $item->find('td')->eq(0);
        $name = Str::replace([' ', ','], '', $nameQp->text());
        $siape = $this->getSiapeId($nameQp->find('a')->first()->attr('href'));

        $relation = $item->find('td')->eq(1)->text();
        $level = $item->find('td')->eq(2)->text();
        $telephone = $item->find('td')->eq(3)->text();

        $lattes = $item->find('td')
            ->eq(4)
            ->find('a')
            ->first()
            ->attr('href');
        $email = $item->find('td')
            ->eq(5)
            ->find('a')
            ->first()
            ->attr('href');
        $email = Str::replace('mailto:', '', $email);

        $data = compact('name', 'relation', 'level', 'telephone', 'lattes', 'email');
        $data = array_map('trim', $data);
        $data['siape'] = $siape;

        return $data;
    }
}
