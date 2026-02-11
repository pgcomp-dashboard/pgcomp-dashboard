<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AccreditationService
{
    /**
     * @param int $year1
     * @param int $year2
     * @return \Illuminate\Support\Collection
     */
    public function getAccreditationRanking($year1, $year2)
    {
        return User::professors()
            ->join('users_productions', 'users.id', '=', 'users_productions.users_id')
            ->join('productions', 'users_productions.productions_id', '=', 'productions.id')
            ->join('publishers', 'productions.publisher_id', '=', 'publishers.id')
            ->join('stratum_qualis', 'publishers.stratum_qualis_id', '=', 'stratum_qualis.id')
            ->whereBetween('productions.year', [$year1, $year2])
            ->groupBy('users.id', 'users.name', 'users.category', 'users.lattes_url')
            ->select('users.id as user_id', 'users.name', 'users.category', 'users.lattes_url')
            ->selectRaw('SUM(stratum_qualis.score) as total_score')
            ->orderBy('total_score', 'desc')
            ->get();
    }

    /**
     * @param int $userId
     * @param int $year1
     * @param int $year2
     * @return array
     */
    public function getAccreditationUserDetails($userId, $year1, $year2)
    {
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

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'category' => $user->category,
            'lattes_url' => $user->lattes_url,
            'total_score' => (float) $productions->sum('score'),
            'productions' => $productions
        ];
    }
}
