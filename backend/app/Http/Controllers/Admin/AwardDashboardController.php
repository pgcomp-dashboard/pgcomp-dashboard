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
            'years' => ['sometimes', 'string', 'regex:/^(?:\d{4}(?:,\d{4})*|none)$/'],
        ]);
        $selectedYears = array_key_exists('years', $validated)
            ? ($validated['years'] === 'none'
                ? []
                : array_map('intval', explode(',', $validated['years'])))
            : (isset($validated['year']) ? [(int) $validated['year']] : null);

        $applyYearFilter = fn ($query) => $query->when(
            $selectedYears !== null,
            fn ($query) => $query->whereIn('year', $selectedYears)
        );
        $filtered = fn () => $applyYearFilter(Award::query());
        $filteredCharts = array_key_exists('years', $validated)
            ? $filtered
            : fn () => Award::query();

        // Pessoas premiadas por vínculo (um prêmio pode ter vários vencedores).
        $byType = AwardWinner::query()
            ->whereHas('award', $applyYearFilter)
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
        $perYear = $filteredCharts()
            ->selectRaw('year, count(*) as total')
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn ($row) => [
                'year' => (int) $row->year,
                'total' => (int) $row->total,
            ]);
        $perYearByScope = $filteredCharts()
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
            ->when(
                $selectedYears !== null,
                fn ($query) => $query->whereIn('awards.year', $selectedYears)
            )
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
        $perYearByScope = $perYear->map(fn ($row) => [
            'year' => (int) $row['year'],
            'national' => (int) ($perYearByScope->get($row['year'], ['national' => 0])['national']),
            'international' => (int) ($perYearByScope->get($row['year'], ['international' => 0])['international']),
        ])->values();
        return response()->json([
            'years' => $years,
            'total' => $filtered()->count(),
            'by_recipient_type' => collect(AwardRecipientType::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byType[$v] ?? 0)]),
            'by_scope' => collect(AwardScope::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byScope[$v] ?? 0)]),
            'per_category' => $perCategory->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total]),
            'per_year' => $perYear,
            'per_year_by_scope' => $perYearByScope,
            'awards_by_professor' => $awardsByRecipient(AwardRecipientType::PROFESSOR->value),
            'awards_by_student' => $awardsByRecipient(AwardRecipientType::STUDENT->value),
        ]);
    }
}
