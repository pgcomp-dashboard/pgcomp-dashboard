<?php

namespace App\Domain\Sigaa;

use App\Enums\UserType;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DefenseScraping extends BaseScraping
{
    public function scrapingByProgram(int $programId): array
    {
        $dom = $this->getDOMQuery('https://sigaa.ufba.br/sigaa/public/programa/defesas.jsf', ['id' => $programId]);

        $items = $dom->find('div#listagem_tabela table#table_lt tr')->getIterator();

        $ret = [];

        $course_id = null;
        foreach ($items as $item) {
            $tdCount = $item->find('td')->count();
            if ($tdCount === 1) {
                $course = $item->find('td')->first()->text();
                $course = Str::of($course)->trim()->value();
                $course_id = $this->getCourseId($course);
            } elseif ($tdCount === 3) {
                $line = $item->find('td')->eq(1);

                $student = $line->find('li')->first()->text();
                $student = Str::of($student)->trim()->title()->value();

                $title = $line->find('li')->eq(1)->text();
                $title = Str::of($title)->trim()->title()->value();

                $teacher = $line->find('li')->eq(2)->text();
                $teacher = Str::of($teacher)->after('Orientador :')->trim()->title()->value();

                $date = null;

                foreach ($line->find('li')->getIterator() as $subLine) {
                    $str = Str::of($subLine->text());
                    if ($str->contains('Data:')) {
                        $date = $str->match('/\d{2}\/\d{2}\/\d{4}/')->value();
                        $date = Carbon::createFromFormat('d/m/Y', $date)->toDateString();
                        break;
                    }
                }
                $ret[] = compact('course_id', 'student', 'title', 'teacher', 'date', 'programId');
            }
        }

        return $ret;
    }

    private function getCourseId(string $course): ?int
    {
        if (! $course) {
            return null;
        }
        $name = match ($course) {
            'Dissertações' => 'Mestrado',
            'Teses' => 'Doutorado',
            default => $course,
        };

        return Course::where('name', $name)->first(['id'])->id;
    }
}
