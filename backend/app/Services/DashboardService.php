<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    public function getAdvisorsWithCounts($userType, $attributes)
    {
        $courseNameForCount = null;
        if ($userType === 'doutorando') {
            $courseNameForCount = 'Doutorado';
        } elseif ($userType === 'mestrando') {
            $courseNameForCount = 'Mestrado';
        }

        $advisors = User::where('type', UserType::PROFESSOR)->get($attributes);

        return $advisors->map(function ($advisor) use ($courseNameForCount, $userType, $attributes) {
            $count = 0;

            if ($userType === 'completed') {
                $count = User::countDefendedAdvisedStudentsByProfessor($advisor->id, $courseNameForCount);
            } else {
                $countsByCourse = User::countAdvisedStudentsByProfessorAndCourse($advisor->id, $courseNameForCount);
                $count = array_sum($countsByCourse);
            }

            return $advisor->only($attributes) + ['advisedes_count' => $count];
        })->sortByDesc('advisedes_count')->values();
    }

    public function getDefensesPerYear()
    {
        $mestrado = User::mestrandos()
            ->whereNotNull('defended_at')
            ->selectRaw('YEAR(defended_at) AS year, COUNT(*) AS total')
            ->groupBy('year')
            ->pluck('total', 'year');

        $doutorado = User::doutorandos()
            ->whereNotNull('defended_at')
            ->selectRaw('YEAR(defended_at) AS year, COUNT(*) AS total')
            ->groupBy('year')
            ->pluck('total', 'year');

        $allYears = collect($mestrado->keys())->merge($doutorado->keys())->unique()->sort();

        return $allYears->map(function ($year) use ($mestrado, $doutorado) {
            return [
                'year' => $year,
                'mestrado' => $mestrado[$year] ?? 0,
                'doutorado' => $doutorado[$year] ?? 0,
            ];
        })->values();
    }

    public function getEnrollmentsPerYear()
    {
        $anoAtual = date("Y");

        $mestrado = User::mestrandos()
            ->whereRaw("LENGTH(registration) >= 4")
            ->selectRaw("CAST(SUBSTRING(registration, 1, 4) AS UNSIGNED) as year, COUNT(*) as total")
            ->groupBy("year")
            ->havingRaw("year >= 2000 AND year <= ?", [$anoAtual])
            ->pluck("total", "year");

        $doutorado = User::doutorandos()
            ->whereRaw("LENGTH(registration) >= 4")
            ->selectRaw("CAST(SUBSTRING(registration, 1, 4) AS UNSIGNED) as year, COUNT(*) as total")
            ->groupBy("year")
            ->havingRaw("year >= 2000 AND year <= ?", [$anoAtual])
            ->pluck("total", "year");

        $allYears = collect($mestrado->keys())->merge($doutorado->keys())->unique()->sort();

        return $allYears->map(function ($year) use ($mestrado, $doutorado) {
            return [
                'year' => $year,
                'mestrado' => $mestrado[$year] ?? 0,
                'doutorado' => $doutorado[$year] ?? 0,
            ];
        })->values();
    }

    public function getStudentCountPerCourse()
    {
        $courses = Course::withCount([
            'students',
            'students as completed_count' => function($q){
                $q->whereNotNull('defended_at');
            },
            'students as in_progress_count' => function($q){
                $q->whereNull('defended_at');
            },
        ])->get(['name']);

        return $courses->mapWithKeys(function($c){
            return [
                $c->name => [
                    'in_progress' => $c->in_progress_count,
                    'completed'   => $c->completed_count,
                ]
            ];
        });
    }

    public function getProfessorProduction($professorId, $anoInicial, $anoFinal)
    {
        $producoes = Production::join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
            ->where('users_productions.users_id', $professorId)
            ->whereBetween('productions.year', [$anoInicial, $anoFinal])
            ->selectRaw('productions.year as ano, COUNT(*) as total')
            ->groupBy('productions.year')
            ->orderBy('productions.year')
            ->get();

        $resultado = [];
        foreach (range($anoInicial, $anoFinal) as $ano) {
            $producaoAno = $producoes->firstWhere('ano', $ano);
            $resultado[$ano] = $producaoAno ? $producaoAno->total : 0;
        }

        return $resultado;
    }

    /**
     * @param  ?string  $user_type  the type of the user, if he is a student or a teacher
     * @param  ?string  $course_id  course_id
     * @param  ?string  $publisher_type  type of publisher
     * @return array returns an array containing the amount by total production separated by year
     */
    public function getTotalProductionsPerYear(?string $user_type, ?string $course_id, ?string $publisher_type): array
    {
        $years = range(2014, Carbon::now()->year);
        $data = [];
        foreach ($years as $year) {
            $data[] = Production::where('year', $year)
                ->when($publisher_type, function ($builder, $publisherType) {
                    $builder->whereHas('publisher', function ($q) use ($publisherType) {
                        $q->where('publisher_type', $publisherType);
                    });
                })
                ->when($user_type, function ($builder, $userType) {
                    $builder->whereHas('isWroteBy', function ($builder) use ($userType) {
                        $builder->where('type', $userType);
                    });
                })
                ->when($course_id, function ($builder, $courseId) {
                    $builder->whereHas('isWroteBy', function ($builder) use ($courseId) {
                        $builder->where('course_id', $courseId);
                    });
                })
                ->distinct()
                ->count();
        }

        return compact('years', 'data');
    }

    /**
     * @param string the type and publication (journal or conference)
     * @return array returns an array containing publications of the desired type separated by course
     */
    public function getTotalProductionsPerCourse($publisherType): array
    {
        $years = range(2014, Carbon::now()->year);
        $courses = Course::all();
        $data = [];
        /** @var Course $course */
        foreach ($courses as $course) {
            $courseData = ['label' => $course->name, 'data' => []];
            foreach ($years as $year) {
                $courseData['data'][] = Production::where('year', $year)
                    ->when($publisherType, function ($builder, $publisherType) {
                        $builder->whereHas('publisher', function ($builder) use ($publisherType) {
                            $builder->where('publisher_type', $publisherType);
                        });
                    })
                    ->whereHas('isWroteBy', function ($builder) use ($course) {
                        $builder->where('course_id', $course->id);
                    })
                    ->distinct()
                    ->count();
            }
            $data[] = $courseData;
        }

        return compact('years', 'data');
    }

    /**
     * @param int year to start count
     * @return \Illuminate\Support\Collection of each user and their total score
     */
    public function findAllProfessorQualisSumByYear($year1, $year2)
    {
        return DB::table('productions')
            ->select('users.id', 'users.name', 'users.category', 'users.lattes_url', DB::raw('SUM(stratum_qualis.score) as score'))
            ->join(
                'users_productions',
                'productions.id',
                '=',
                'users_productions.productions_id'
            )
            ->join('users', 'users.id', '=', 'users_productions.users_id')
            ->join('stratum_qualis', 'productions.stratum_qualis_id', '=', 'stratum_qualis.id')
            ->where('users.type', '=', 'professor')
            ->whereBetween('productions.year', [$year1, $year2])
            ->groupBy('users.id', 'users.name', 'users.category', 'users.lattes_url')
            ->orderBy('score', 'desc')
            ->get();
    }

}
