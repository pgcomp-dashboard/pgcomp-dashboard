<?php

namespace App\Services\Admin;

use App\Enums\PublisherType;
use App\Models\Configuration;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AccreditationService
{
    /**
     * @param int|null $year1
     * @param int|null $year2
     * @return Collection
     */
    public function getAccreditationRanking($year1 = null, $year2 = null)
    {
        $rules = Configuration::get('accreditation', 'rules', [
            'initial_year' => date("Y"),
            'final_year' => date("Y"),
            'is_pq_required' => false,
            'is_senior_required' => false,
            'min_journals' => 0,
            'min_score' => 0,
        ]);

        $year1 = $year1 ?? ($rules['initial_year'] ?? date("Y"));
        $year2 = $year2 ?? ($rules['final_year'] ?? date("Y"));
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
                'users.is_senior',
                DB::raw('SUM(COALESCE(stratum_qualis.score, 0)) as total_score'),
                DB::raw('GROUP_CONCAT(CONCAT(publishers.publisher_type, ":", stratum_qualis.code)) as qualis_data')
            ])
            ->leftJoin('users_productions', 'users.id', '=', 'users_productions.users_id')
            ->leftJoin('productions', function($join) use ($year1, $year2) {
                $join->on('users_productions.productions_id', '=', 'productions.id')
                    ->whereBetween('productions.year', [$year1, $year2]);
            })
            ->leftJoin('publishers', 'productions.publisher_id', '=', 'publishers.id')
            ->leftJoin('stratum_qualis', 'publishers.stratum_qualis_id', '=', 'stratum_qualis.id')
            ->groupBy('users.id', 'users.name', 'users.category', 'users.lattes_url', 'users.pq', 'users.is_senior')
            ->orderBy('total_score', 'desc');

        $ranking = $query->get();
        $isSeniorRequired = $rules['is_senior_required'] ?? false;

        return $ranking->map(function ($user) use ($isPqRequired, $isSeniorRequired, $minJournals, $minScore) {
            $dataList = $user->qualis_data ? explode(',', $user->qualis_data) : [];
            $fullBreakdown = array_count_values($dataList);

            // Calculate A1-A4 journal-only count
            $a1A4Count = 0;
            foreach (['A1', 'A2', 'A3', 'A4'] as $code) {
                $a1A4Count += ($fullBreakdown["journal:{$code}"] ?? 0);
            }

            // Create qualis_breakdown for the response (A1-A4 should include only journals)
            $breakdown = [];
            foreach ($fullBreakdown as $key => $count) {
                // key is "publisher_type:code"
                if (strpos($key, ':') !== false) {
                    [$type, $code] = explode(':', $key);

                    // Only include journals with Qualis A1, A2, A3, or A4 in the breakdown
                    if ($type === 'journal' && in_array($code, ['A1', 'A2', 'A3', 'A4'])) {
                        $breakdown[$code] = ($breakdown[$code] ?? 0) + $count;
                    }
                }
            }

            $isAccredited = false;
            $reasons = [];

            $meetsScore = $user->total_score >= $minScore;
            $meetsJournals = $a1A4Count >= $minJournals;
            $isPqAndRequired = $isPqRequired && $user->pq;
            $isSeniorAndRequired = $isSeniorRequired && $user->is_senior;

            if ($meetsScore && $meetsJournals) {
                $isAccredited = true;
            } elseif ($isPqAndRequired) {
                $isAccredited = true;
            } elseif ($isSeniorAndRequired) {
                $isAccredited = true;
            } else {
                if (!$meetsScore) {
                    $reasons[] = "Pontuação insuficiente ({$user->total_score} < {$minScore})";
                }
                if (!$meetsJournals) {
                    $reasons[] = "Publicações A1-A4 insuficientes ({$a1A4Count} < {$minJournals})";
                }
                if ($isPqRequired && !$user->pq) {
                    $reasons[] = 'Não é bolsista PQ';
                }
                if ($isSeniorRequired && !$user->is_senior) {
                    $reasons[] = 'Não é docente sênior';
                }
            }

            $user->is_accredited = $isAccredited;
            $user->reasons = $reasons;
            $user->total_score = (float) $user->total_score;
            $user->a1_a4_count = $a1A4Count;
            $user->qualis_breakdown = $breakdown;

            unset($user->qualis_data); // No need to send the raw string

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
        $rules = Configuration::get('accreditation', 'rules', [
            'initial_year' => date("Y") - 4,
            'final_year' => date("Y") - 1,
            'is_pq_required' => false,
            'is_senior_required' => false,
            'min_journals' => 0,
            'min_score' => 0,
        ]);

        $year1 = $year1 ?? $rules['initial_year'];
        $year2 = $year2 ?? $rules['final_year'];
        $isPqRequired = $rules['is_pq_required'] ?? false;
        $isSeniorRequired = $rules['is_senior_required'] ?? false;
        $minJournals = $rules['min_journals'] ?? 0;
        $minScore = $rules['min_score'] ?? 0;

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
            $production->publisher_type = $production->publisher->publisher_type ?? null;
            $production->score = (float) ($qualis->score ?? 0);
            return $production;
        });

        $totalScore = (float) $productions->sum('score');

        // qualisBreakdown for the UI (A1-A4 should include only journals)
        $qualisBreakdown = [];
        foreach ($productions as $p) {
            $type = $p->publisher_type instanceof PublisherType ? $p->publisher_type->value : $p->publisher_type;
            if ($type === 'journal' && in_array($p->code, ['A1', 'A2', 'A3', 'A4'])) {
                $qualisBreakdown[$p->code] = ($qualisBreakdown[$p->code] ?? 0) + 1;
            }
        }

        // a1A4Count for the rule (only journals)
        $a1A4Count = $productions->filter(function($p) {
            return in_array($p->code, ['A1', 'A2', 'A3', 'A4']) && $p->publisher_type === 'journal';
        })->count();

        $isAccredited = false;
        $reasons = [];

        $meetsScore = $totalScore >= $minScore;
        $meetsJournals = $a1A4Count >= $minJournals;
        $isPqAndRequired = $isPqRequired && $user->pq;
        $isSeniorAndRequired = $isSeniorRequired && $user->is_senior;

        if ($meetsScore && $meetsJournals) {
            $isAccredited = true;
        } elseif ($isPqAndRequired) {
            $isAccredited = true;
        } elseif ($isSeniorAndRequired) {
            $isAccredited = true;
        } else {
            if (!$meetsScore) {
                $reasons[] = "Pontuação insuficiente ({$totalScore} < {$minScore})";
            }
            if (!$meetsJournals) {
                $reasons[] = "Publicações A1-A4 insuficientes ({$a1A4Count} < {$minJournals})";
            }
            if ($isPqRequired && !$user->pq) {
                $reasons[] = 'Não é bolsista PQ';
            }
            if ($isSeniorRequired && !$user->is_senior) {
                $reasons[] = 'Não é docente sênior';
            }
        }

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'category' => $user->category,
            'lattes_url' => $user->lattes_url,
            'pq' => $user->pq,
            'is_senior' => $user->is_senior,
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
