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

        $years = Award::query()->distinct()->orderByDesc('year')->pluck('year');
        $perYear = Award::query()
            ->selectRaw('year, count(*) as total')
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn ($row) => [
                'year' => (int) $row->year,
                'total' => (int) $row->total,
            ]);
        $perYearByScope = Award::query()
            ->selectRaw('year, scope, count(*) as total')
            ->groupBy('year', 'scope')
            ->get()
            ->groupBy('year')
            ->map(fn ($scopes) => [
                'national' => (int) ($scopes->firstWhere('scope', AwardScope::NATIONAL->value)?->total ?? 0),
                'international' => (int) ($scopes->firstWhere('scope', AwardScope::INTERNATIONAL->value)?->total ?? 0),
            ]);
        $awardsByRecipient = fn (string $recipientType) => AwardWinner::query()
            ->leftJoin('users', 'users.id', '=', 'award_winners.user_id')
            ->join('awards', 'awards.id', '=', 'award_winners.award_id')
            ->where('award_winners.recipient_type', $recipientType)
            ->when($year, fn ($query) => $query->where('awards.year', $year))
            ->selectRaw('COALESCE(users.name, award_winners.name) as name, COUNT(*) as total')
            ->groupBy('award_winners.user_id')
            ->groupByRaw('COALESCE(users.name, award_winners.name)')
            ->orderByDesc('total')
            ->orderBy('name')
            ->get()
            ->map(fn ($winner) => [
                'name' => $winner->name,
                'total' => (int) $winner->total,
            ])
            ->values();
        $perYearByScope = $years->map(fn ($awardYear) => [
                'year' => (int) $awardYear,
                'national' => $perYearByScope->get($awardYear, ['national' => 0])['national'],
                'international' => $perYearByScope->get($awardYear, ['international' => 0])['international'],
            ])
            ->sortBy('year')
            ->values();
        return response()->json([
            'years' => $years,
            'total' => $filtered()->count(),
            'by_recipient_type' => collect(AwardRecipientType::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byType[$v] ?? 0)]),
            'by_scope' => collect(AwardScope::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byScope[$v] ?? 0)]),
            'per_category' => $perCategory->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total]),
            // Ignora o filtro de ano: mostra a evolução completa.
            'per_year' => $perYear,
            'per_year_by_scope' => $perYearByScope,
            'awards_by_professor' => $awardsByRecipient(AwardRecipientType::PROFESSOR->value),
            'awards_by_student' => $awardsByRecipient(AwardRecipientType::STUDENT->value),
        ]);
    }
}
