<?php

namespace App\Domain\Sigaa;

use Exception;
use Illuminate\Support\Str;
use QueryPath\DOMQuery;

class StudentScraping extends BaseScraping
{
    /**
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

    private function extractStudent(DOMQuery $item): array
    {
        $registration = (int)trim($item->find('td')->eq(0)->text());

        $course = $item->parent('div#listagem_tabela')->children('div#group_lt')->text();
        $course = Str::before($course, '(');
        $course = trim($course);

        $td1Element = $item->find('td')->eq(1);
        $teachers = [];
        foreach ($td1Element->find('a')->getIterator() as $teacherElement) {
            $teachers[] = [
                'siape' => $this->getSiapeId($teacherElement->attr('href')),
                'name' => Str::before(trim($teacherElement->text()), '('),
                'type' => Str::between($teacherElement->text(), '(', ')'),
            ];
        }

        $separator = '********';
        [$name] = explode($separator, $td1Element->childrenText($separator));
        $name = Str::replace([' ', ','], '', $name);
        $name = trim($name);

        return compact('registration', 'name', 'teachers', 'course');
    }

}
