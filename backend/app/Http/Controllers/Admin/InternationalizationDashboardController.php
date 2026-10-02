<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InternationalizationLattesStatus;
use App\Enums\InternationalizationLevel;
use App\Http\Controllers\Controller;
use App\Models\InternationalizationAction;
use Illuminate\Http\Request;

class InternationalizationDashboardController extends Controller
{
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'year' => 'nullable|integer|min:1900',
        ]);
        $year = $validated['year'] ?? null;

        // O ano de uma ação é o ano em que ela começou.
        $filtered = fn () => InternationalizationAction::query()
            ->when($year, fn ($q) => $q->whereYear('start_date', $year));

        $byLevel = $filtered()->selectRaw('level, count(*) as total')->groupBy('level')->pluck('total', 'level');
        $byLattes = $filtered()->selectRaw('lattes_status, count(*) as total')->groupBy('lattes_status')->pluck('total', 'lattes_status');

        $perCategory = $filtered()
            ->join('internationalization_categories as c', 'c.id', '=', 'internationalization_actions.category_id')
            ->selectRaw('c.name as name, count(*) as total')
            ->groupBy('c.id', 'c.name')
            ->orderByDesc('total')->orderBy('name')
            ->get();

        $perCountry = $filtered()
            ->whereNotNull('country')->where('country', '!=', '')
            ->selectRaw('country as name, count(*) as total')
            ->groupBy('country')
            ->orderByDesc('total')->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json([
            'years' => InternationalizationAction::query()
                ->selectRaw('distinct year(start_date) as y')->orderByDesc('y')->pluck('y')
                ->map(fn ($y) => (int) $y)->values(),
            'total' => $filtered()->count(),
            'countries_count' => $filtered()->whereNotNull('country')->where('country', '!=', '')->distinct()->count('country'),
            'by_level' => collect(InternationalizationLevel::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byLevel[$v] ?? 0)]),
            'by_lattes_status' => collect(InternationalizationLattesStatus::values())
                ->mapWithKeys(fn ($v) => [$v => (int) ($byLattes[$v] ?? 0)]),
            'per_category' => $perCategory->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total]),
            'per_country' => $perCountry->map(fn ($r) => ['name' => $r->name, 'total' => (int) $r->total]),
            // Ignora o filtro de ano: mostra a evolução completa.
            'per_year' => InternationalizationAction::query()
                ->selectRaw('year(start_date) as year, count(*) as total')
                ->groupBy('year')->orderBy('year')->get()
                ->map(fn ($r) => ['year' => (int) $r->year, 'total' => (int) $r->total]),
        ]);
    }
}
