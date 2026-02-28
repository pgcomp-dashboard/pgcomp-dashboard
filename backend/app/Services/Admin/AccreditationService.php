<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AccreditationService
{
    /**
     * @param int|null $year1
     * @param int|null $year2
     * @return \Illuminate\Support\Collection
     */
    public function getAccreditationRanking($year1 = null, $year2 = null)
    {
        $rules = \App\Models\Configuration::get('accreditation', 'rules', [
            'initial_year' => date("Y") - 4,
            'final_year' => date("Y") - 1,
            'is_pq_required' => false,
            'min_journals' => 0,
            'min_score' => 0,
        ]);

        $year1 = $year1 ?? $rules['initial_year'];
        $year2 = $year2 ?? $rules['final_year'];
        $isPqRequired = $rules['is_pq_required'] ?? false;
        $minJournals = $rules['min_journals'] ?? 0;
        $minScore = $rules['min_score'] ?? 0;

        $query = User::professors()
            ->select([
                'users.id as user_id',
                'users.name',
                'users.category',
                'users.lattes_url',
                'users.pq',
                DB::raw('SUM(COALESCE(stratum_qualis.score, 0)) as total_score'),
                DB::raw('GROUP_CONCAT(stratum_qualis.code) as qualis_codes')
            ])
            ->leftJoin('users_productions', 'users.id', '=', 'users_productions.users_id')
            ->leftJoin('productions', function($join) use ($year1, $year2) {
                $join->on('users_productions.productions_id', '=', 'productions.id')
                    ->whereBetween('productions.year', [$year1, $year2]);
            })
            ->leftJoin('publishers', 'productions.publisher_id', '=', 'publishers.id')
            ->leftJoin('stratum_qualis', 'publishers.stratum_qualis_id', '=', 'stratum_qualis.id')
            ->groupBy('users.id', 'users.name', 'users.category', 'users.lattes_url', 'users.pq')
            ->orderBy('total_score', 'desc');

        $ranking = $query->get();

        return $ranking->map(function ($user) use ($isPqRequired, $minJournals, $minScore) {
            $codesList = $user->qualis_codes ? explode(',', $user->qualis_codes) : [];
            $breakdown = array_count_values($codesList);

            // Ensure A1-A4 count for rules
            $a1A4Count = 0;
            foreach (['A1', 'A2', 'A3', 'A4'] as $code) {
                $a1A4Count += ($breakdown[$code] ?? 0);
            }

            $isAccredited = true;
            $reasons = [];

            if ($isPqRequired && !$user->pq) {
                $isAccredited = false;
                $reasons[] = 'Não é bolsista PQ';
            }

            if ($user->total_score < $minScore) {
                $isAccredited = false;
                $reasons[] = "Pontuação insuficiente ({$user->total_score} < {$minScore})";
            }

            if ($a1A4Count < $minJournals) {
                $isAccredited = false;
                $reasons[] = "Publicações A1-A4 insuficientes ({$a1A4Count} < {$minJournals})";
            }

            $user->is_accredited = $isAccredited;
            $user->reasons = $reasons;
            $user->total_score = (float) $user->total_score;
            $user->a1_a4_count = $a1A4Count;
            $user->qualis_breakdown = $breakdown;

            unset($user->qualis_codes); // No need to send the raw string

            return $user;
        });
    }

    /**
     * @param int $userId
     * @param int|null $year1
     * @param int|null $year2
     * @return array
     */
    public function getAccreditationUserDetails($userId, $year1 = null, $year2 = null)
    {
        $rules = \App\Models\Configuration::get('accreditation', 'rules', [
            'initial_year' => date("Y") - 4,
            'final_year' => date("Y") - 1,
            'is_pq_required' => false,
            'min_journals' => 0,
            'min_score' => 0,
        ]);

        $year1 = $year1 ?? $rules['initial_year'];
        $year2 = $year2 ?? $rules['final_year'];

        $user = User::professors()
            ->with(['writerOf' => function ($query) use ($year1, $year2) {
                $query->whereBetween('year', [$year1, $year2])
                    ->with(['publisher.stratumQualis'])
                    ->orderBy('year', 'desc');
            }])
            ->findOrFail($userId);

        $productions = $user->writerOf->map(function ($production) {
            $qualis = $production->publisher->stratumQualis ?? null;
            $production->code = $qualis->code ?? 'N/I';
            $production->score = (float) ($qualis->score ?? 0);
            return $production;
        });

        $totalScore = (float) $productions->sum('score');
        $qualisBreakdown = array_count_values($productions->pluck('code')->toArray());
        $a1A4Count = 0;
        foreach (['A1', 'A2', 'A3', 'A4'] as $code) {
            $a1A4Count += ($qualisBreakdown[$code] ?? 0);
        }

        $isAccredited = true;
        $reasons = [];

        if (($rules['is_pq_required'] ?? false) && !$user->pq) {
            $isAccredited = false;
            $reasons[] = 'Não é bolsista PQ';
        }

        if ($totalScore < ($rules['min_score'] ?? 0)) {
            $isAccredited = false;
            $reasons[] = "Pontuação insuficiente ({$totalScore} < " . ($rules['min_score'] ?? 0) . ")";
        }

        if ($a1A4Count < ($rules['min_journals'] ?? 0)) {
            $isAccredited = false;
            $reasons[] = "Publicações A1-A4 insuficientes ({$a1A4Count} < " . ($rules['min_journals'] ?? 0) . ")";
        }

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'category' => $user->category,
            'lattes_url' => $user->lattes_url,
            'pq' => $user->pq,
            'total_score' => $totalScore,
            'a1_a4_count' => $a1A4Count,
            'qualis_breakdown' => $qualisBreakdown,
            'is_accredited' => $isAccredited,
            'reasons' => $reasons,
            'productions' => $productions,
            'rules' => $rules
        ];
    }
}
