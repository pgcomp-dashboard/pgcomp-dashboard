<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AwardRecipientType;
use App\Enums\AwardScope;
use App\Http\Controllers\Controller;
use App\Models\Award;
use App\Models\AwardWinner;
use Illuminate\Http\Request;

class AwardDashboardController extends Controller
{
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'year' => 'nullable|integer|min:1900',
        ]);
        $year = $validated['year'] ?? null;

        $filtered = fn () => Award::query()->when($year, fn ($q) => $q->where('year', $year));

        // Pessoas premiadas por vínculo (um prêmio pode ter vários vencedores).
        $byType = AwardWinner::query()
            ->whereHas('award', fn ($q) => $q->when($year, fn ($q) => $q->where('year', $year)))
            ->selectRaw('recipient_type, count(*) as total')
            ->groupBy('recipient_type')->pluck('total', 'recipient_type');
        $byScope = $filtered()->selectRaw('scope, count(*) as total')
            ->groupBy('scope')->pluck('total', 'scope');

        $perCategory = $filtered()
            ->join('award_categories', 'award_categories.id', '=', 'awards.award_category_id')
            ->selectRaw('award_categories.name as name, count(*) as total')
            ->groupBy('award_categories.id', 'award_categories.name')
            ->orderByDesc('total')->orderBy('name')
            ->get();

        return response()->json([
            'years' => Award::query()->distinct()->orderByDesc('year')->pluck('year'),
            'total' => $filtered()->count(),
            'by_recipient_type' => collect(AwardRecipientType::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byType[$v] ?? 0)]),
            'by_scope' => collect(AwardScope::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byScope[$v] ?? 0)]),
            'per_category' => $perCategory->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total]),
            // Ignora o filtro de ano: mostra a evolução completa.
            'per_year' => Award::query()->selectRaw('year, count(*) as total')
                ->groupBy('year')->orderBy('year')->get()
                ->map(fn ($r) => ['year' => (int) $r->year, 'total' => (int) $r->total]),
        ]);
    }
}
