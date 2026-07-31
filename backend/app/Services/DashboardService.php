<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Database\Eloquent\Collection;
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

        $query = User::where('type', UserType::PROFESSOR)
            ->withCount(['advisedes as advisedes_count' => function ($query) use ($userType, $courseNameForCount) {
                if ($userType === 'completed') {
                    $query->whereNotNull('defended_at');
                } else {
                    $query->whereNull('defended_at');
                }

                if ($courseNameForCount) {
                    $query->whereHas('course', function ($q) use ($courseNameForCount) {
                        $q->where('name', $courseNameForCount);
                    });
                }
            }]);

        return $query->get(array_merge($attributes, ['advisedes_count']))
            ->sortByDesc('advisedes_count')
            ->values();
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

    public function getProfessorProduction($professorId, $anoInicial, $anoFinal, ?string $publisherType = null, ?array $qualis_codes = null)
    {
        $producoes = Production::join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
            ->where('users_productions.users_id', $professorId)
            ->whereBetween('productions.year', [$anoInicial, $anoFinal])
            ->when($publisherType, function ($q) use ($publisherType) {
                $q->where('publisher_type', $publisherType);
            })
            ->when($qualis_codes, function ($q) use ($qualis_codes) {
                $ids = StratumQualis::whereIn('code', $qualis_codes)->pluck('id');
                $q->whereIn('productions.stratum_qualis_id', $ids);
            })
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
        $yearsRange = range(2014, Carbon::now()->year);

        $results = Production::select('year', DB::raw('count(distinct id) as total'))
            ->whereIn('year', $yearsRange)
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
            ->groupBy('year')
            ->pluck('total', 'year');

        $data = array_map(fn($year) => $results[$year] ?? 0, $yearsRange);

        return ['years' => $yearsRange, 'data' => $data];
    }

    /**
     * @param string the type and publication (journal or conference)
     * @return array returns an array containing publications of the desired type separated by course
     */
    public function getTotalProductionsPerCourse($publisherType): array
    {
        $yearsRange = range(2014, Carbon::now()->year);
        $courses = Course::all();

        $queryResults = Production::select('year', 'users.course_id', DB::raw('count(distinct productions.id) as total'))
            ->join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->whereIn('productions.year', $yearsRange)
            ->when($publisherType, function ($builder, $publisherType) {
                $builder->whereHas('publisher', function ($q) use ($publisherType) {
                    $q->where('publisher_type', $publisherType);
                });
            })
            ->groupBy('productions.year', 'users.course_id')
            ->get();

        $data = $courses->map(function ($course) use ($yearsRange, $queryResults) {
            $courseYearlyData = [];
            foreach ($yearsRange as $year) {
                $match = $queryResults->where('year', $year)->where('course_id', $course->id)->first();
                $courseYearlyData[] = $match ? $match->total : 0;
            }
            return [
                'label' => $course->name,
                'data' => $courseYearlyData
            ];
        })->toArray();

        return ['years' => $yearsRange, 'data' => $data];
    }
}