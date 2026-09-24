<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Configuration;
use Illuminate\Support\Facades\DB;

class StudentRankingService
{
    public function getRanking($year1 = null, $year2 = null, ?int $courseId = null, int $perPage = 15, int $page = 1, string $sort = 'position', string $direction = 'desc')
    {
        $rules = Configuration::get('student_ranking', 'rules', [
            'initial_year' => date('Y') - 4,
            'final_year' => date('Y'),
            'min_journals' => 0,
            'min_journals_a1a2' => 0,
            'min_score' => 0,
        ]);

        $year1 = $year1 ?? ($rules['initial_year'] ?? date('Y') - 4);
        $year2 = $year2 ?? ($rules['final_year'] ?? date('Y'));
        $minJournals = (int) ($rules['min_journals'] ?? 0);
        $minJournalsA1A2 = (int) ($rules['min_journals_a1a2'] ?? 0);
        $minScore = (float) ($rules['min_score'] ?? 0);

        $query = User::students()
            ->select([
                'users.id as user_id',
                'users.name',
                'users.registration',
                'courses.name as course_name',
                'areas.area as area_name',
                DB::raw('COUNT(DISTINCT productions.id) as productions_count'),
                DB::raw('SUM(COALESCE(stratum_qualis.score, 0)) as total_score'),
                DB::raw('ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(stratum_qualis.score, 0)) DESC, COUNT(DISTINCT productions.id) DESC, users.id DESC) as position'),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code IN ('A1', 'A2', 'A3', 'A4') THEN 1 ELSE 0 END) as a1_a4_count"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code IN ('A1', 'A2') THEN 1 ELSE 0 END) as a1_a2_count"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code = 'A1' THEN 1 ELSE 0 END) as ja1"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code = 'A2' THEN 1 ELSE 0 END) as ja2"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code = 'A3' THEN 1 ELSE 0 END) as ja3"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code = 'A4' THEN 1 ELSE 0 END) as ja4"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'conference' AND stratum_qualis.code = 'A1' THEN 1 ELSE 0 END) as ca1"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'conference' AND stratum_qualis.code = 'A2' THEN 1 ELSE 0 END) as ca2"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'conference' AND stratum_qualis.code = 'A3' THEN 1 ELSE 0 END) as ca3"),
                DB::raw("SUM(CASE WHEN publishers.publisher_type = 'conference' AND stratum_qualis.code = 'A4' THEN 1 ELSE 0 END) as ca4"),
            ])
            ->leftJoin('courses', 'users.course_id', '=', 'courses.id')
            ->leftJoin('areas', 'users.area_id', '=', 'areas.id')
            ->leftJoin('users_productions', 'users.id', '=', 'users_productions.users_id')
            ->leftJoin('productions', function ($join) use ($year1, $year2) {
                $join->on('users_productions.productions_id', '=', 'productions.id')
                    ->whereBetween('productions.year', [$year1, $year2]);
            })
            ->leftJoin('publishers', 'productions.publisher_id', '=', 'publishers.id')
            ->leftJoin('stratum_qualis', 'publishers.stratum_qualis_id', '=', 'stratum_qualis.id');

        if ($courseId !== null) {
            $query->where('users.course_id', $courseId);
        }

        $sortColumns = [
            'position' => 'total_score',
            'name' => 'users.name',
            'registration' => 'users.registration',
            'course_name' => 'courses.name',
            'area_name' => 'areas.area',
            'productions_count' => 'productions_count',
            'a1_a4_count' => 'a1_a4_count',
            'a1_a2_count' => 'a1_a2_count',
            'total_score' => 'total_score',
            'status' => DB::raw("CASE WHEN SUM(COALESCE(stratum_qualis.score, 0)) >= {$minScore} AND (SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code IN ('A1', 'A2', 'A3', 'A4') THEN 1 ELSE 0 END) >= {$minJournals} OR SUM(CASE WHEN publishers.publisher_type = 'journal' AND stratum_qualis.code IN ('A1', 'A2') THEN 1 ELSE 0 END) >= {$minJournalsA1A2}) THEN 1 ELSE 0 END"),
        ];

        $sortColumn = $sortColumns[$sort] ?? $sortColumns['position'];
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        return $query
            ->groupBy('users.id', 'users.name', 'users.registration', 'courses.name', 'areas.area')
            ->orderBy($sortColumn, $direction)
            ->orderBy('users.id', 'desc')
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(function ($student) use ($minJournals, $minJournalsA1A2, $minScore) {
                $student->total_score = (float) $student->total_score;
                $student->productions_count = (int) $student->productions_count;
                $student->a1_a4_count = (int) $student->a1_a4_count;
                $student->a1_a2_count = (int) $student->a1_a2_count;
                foreach (['ja1', 'ja2', 'ja3', 'ja4', 'ca1', 'ca2', 'ca3', 'ca4'] as $count) {
                    $student->{$count} = (int) $student->{$count};
                }
                $isEligible = $student->total_score >= $minScore
                    && ($student->a1_a4_count >= $minJournals || $student->a1_a2_count >= $minJournalsA1A2);
                $reasons = [];

                if ($student->total_score < $minScore) {
                    $reasons[] = "Pontuação insuficiente ({$student->total_score} < {$minScore})";
                }

                if ($student->a1_a4_count < $minJournals && $student->a1_a2_count < $minJournalsA1A2) {
                    $reasons[] = "Publicações insuficientes A1-A4 ({$student->a1_a4_count} < {$minJournals}), A1-A2 ({$student->a1_a2_count} < {$minJournalsA1A2})";
                }

                $student->setAttribute('is_eligible', $isEligible);
                $student->setAttribute('reasons', $reasons);

                return $student;
            });
    }
}
