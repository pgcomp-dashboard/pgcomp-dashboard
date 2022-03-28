<?php

namespace App\Domain\Sigaa;

use App\Enums\UserRelationType;
use Exception;
use Illuminate\Support\Str;
use QueryPath\DOMQuery;

class StudentScraping extends BaseScraping
{
    /**
     * Extrai os dados de discentes do site SIGAA.
     *
     * @throws Exception
     */
    public function scrapingByCourse(int $courseId): array
    {
        $dom = $this->getDOMQuery('https://sigaa.ufba.br/sigaa/public/programa/alunos.jsf', ['id' => $courseId]);
        $items = $dom->find('div#listagem_tabela table#table_lt tr')->getIterator();

        $students = [];
        foreach ($items as $item) {
            if ($item->hasClass('campos')) {
                continue;
            }
            $students[] = $this->extractStudent($item);
        }

        return $students;
    }

    /**
     * Extrai os dados do discente da linha da tabela HTML.
     *
     * @param DOMQuery $item
     * @return array{registration: string, name: string, course: string, teachers: array{siape: int, name: string, type: string}}
     * @throws Exception
     */
    private function extractStudent(DOMQuery $item): array
    {
        $registration = $item->find('td')->eq(0)->text();
        $registration = (int)trim($registration);

        $course = $item->parent('div#listagem_tabela')->children('div#group_lt')->text();
        $course = Str::of($course)->before('(')->trim()->value();

        $td1Element = $item->find('td')->eq(1);
        $teachers = [];
        foreach ($td1Element->find('a')->getIterator() as $teacherElement) {
            $typeStr = Str::of($teacherElement->text())->between('(', ')')->trim()->lower()->value();
            $type = match ($typeStr) {
                'orientador' => UserRelationType::ADVISOR->value,
                'coorientador' => UserRelationType::CO_ADVISOR->value,
                default => throw new Exception("Unknow relation type {$typeStr}")
            };
            $teachers[] = [
                'siape' => $this->getSiapeIdFromUrl($teacherElement->attr('href')),
                'name' => Str::of($teacherElement->text())->before('(')->trim()->title()->value(),
                'relation_type' => $type,
            ];
        }

        $separator = '********';
        [$name] = explode($separator, $td1Element->childrenText($separator));
        $name = Str::of($name)->replace([' ', ','], '')->trim()->title()->value();

        return compact('registration', 'name', 'teachers', 'course');
    }
}
