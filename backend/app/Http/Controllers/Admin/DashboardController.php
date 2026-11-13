<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Enums\ProductionSource;
use App\Http\Controllers\Controller;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function advisors(Request $request)
    {
        $userType = $request->input('user_type');
        $attributes = ['id', 'name'];

        return $this->dashboardService->getAdvisorsWithCounts($userType, $attributes);
    }

    public function advisorStudents(Request $request, int $professorId)
    {
        $validated = $request->validate([
            'user_type' => 'nullable|in:mestrando,doutorando,completed',
        ]);

        $students = $this->dashboardService->getStudentsForAdvisor($professorId, $validated['user_type'] ?? null);

        return response()->json([
            'status' => 'success',
            'data' => $students,
        ]);
    }

    public function programName()
    {
        // TODO: Retornar o JSON com o nome do programa
        // {
        //  "sigla": "PGCOMP/IC",
        //  "nome": "Programa de pós-graduação em ciência da computação"
        // }

        /**
         * @todo vamos tentar usar o padrão de nomes do banco de dados para evitar renomear.
         */
        $keyReturnPattern = ['sigla', 'nome'];
        $keysSearch = ['name', 'description'];

        //  $program = new Program();
        // return $program->findAllCoursesByColumns($keysSearch, $keyReturnPattern);
        return 'ok';
    }

    public function totalProductionsPerYear(Request $request)
    {
        $publisher_type = match ($request->input('publisher_type')) {
            'journal' => 'journal',
            'conference' => 'conference',
            default => null
        };

        $filter = match ($request->input('user_type')) {
            'docente' => ['professor', null],
            'mestrando' => ['student', '1'],
            'doutorando' => ['student', '2'],
            default => [null, null]
        };

        $qualisInput = $request->input('qualis');
        $qualis_codes = $qualisInput ? explode(',', $qualisInput) : null;

        $result = $this->dashboardService->getTotalProductionsPerYear(
            user_type: $filter[0],
            course_id: $filter[1],
            publisher_type: $publisher_type,
            qualis_codes: $qualis_codes
        );

        $years = $result['years'] ?? [];
        $data = $result['data'] ?? [];
        $assoc = [];
        foreach ($years as $i => $year) {
            $assoc[$year] = $data[$i] ?? 0;
        }

        return response()->json($assoc);
    }

    public function studentsProductions(Request $request)
    {
        // TODO: Retornar lista de anos no JSON
        // TODO: Retornar JSON na estrutura de lista abaixo
        // {
        //  "years": ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        //  "data": {
        //      'label': 'Mestrado',
        //      'data': generateValues(NUMBER_OF_ITEMS),TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //  },
        //  {
        //      'label': 'Doutorado',
        //      'data': generateValues(NUMBER_OF_ITEMS),TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //  }
        // }
        $publisher_type = match ($request->input('publisher_type')) {
            'journal' => 'journal',
            'conference' => 'conference',
            default => null
        };

        $filter = match ($request->input('user_type')) {
            'docente' => ['professor', null],
            'mestrando' => ['student', '1'],
            'doutorando' => ['student', '2'],
            default => [null, null]
        };

        return $this->dashboardService->getTotalProductionsPerYear(
            user_type: $filter[0],
            course_id: $filter[1],
            publisher_type: $publisher_type
        );
    }


    public function productionPerQualis(Request $request)
    {
        $publisher_type = $request->input('publisher_type');

        $filter = match ($request->input('user_type')) {
            'docente' => ['professor', null],
            'mestrando' => ['student', '1'],
            'doutorando' => ['student', '2'],
            default => [null, null]
        };

        $qualisInput = $request->input('qualis');
        $qualis_codes = $qualisInput ? explode(',', $qualisInput) : null;

        $qualis = new StratumQualis;

        return $qualis->totalProductionsPerQualis(
            user_type: $filter[0],
            course_id: $filter[1],
            publisher_type: $publisher_type,
            qualis_codes: $qualis_codes
        );
    }

    public function productionStatistics()
    {
        $faculty = User::query()
            ->where('type', UserType::PROFESSOR)
            ->withCount('writerOf')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $professor) => [
                'id' => $professor->id,
                'name' => $professor->name,
                'total' => (int) $professor->writer_of_count,
            ])
            ->values();

        $facultyTotals = $faculty->pluck('total')->sort()->values();
        $facultyCount = $facultyTotals->count();
        $facultyWithProductionsCount = $faculty->where('total', '>', 0)->count();
        $mean = $facultyCount > 0 ? $facultyTotals->avg() : null;
        $middle = intdiv($facultyCount, 2);
        $median = $facultyCount === 0
            ? null
            : ($facultyCount % 2 === 1
                ? $facultyTotals[$middle]
                : ($facultyTotals[$middle - 1] + $facultyTotals[$middle]) / 2);
        $standardDeviation = $facultyCount > 0
            ? sqrt($facultyTotals->sum(fn ($value) => ($value - $mean) ** 2) / $facultyCount)
            : null;

        $qualisOrder = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'NI'];
        $qualisCodes = StratumQualis::query()
            ->distinct()
            ->orderBy('code')
            ->pluck('code')
            ->push('NI')
            ->unique()
            ->sortBy(fn ($code) => ($index = array_search($code, $qualisOrder, true)) === false
                ? count($qualisOrder)
                : $index)
            ->values();

        $qualisCounts = Production::query()
            ->leftJoin('stratum_qualis', 'stratum_qualis.id', '=', 'productions.stratum_qualis_id')
            ->whereIn('productions.publisher_type', ['conference', 'journal'])
            ->selectRaw("productions.publisher_type, COALESCE(stratum_qualis.code, 'NI') as qualis, COUNT(DISTINCT productions.id) as total")
            ->groupBy('productions.publisher_type', 'qualis')
            ->get()
            ->groupBy('publisher_type');

        $byQualis = function (string $publisherType) use ($qualisCounts, $qualisCodes) {
            $counts = $qualisCounts->get($publisherType, collect())->pluck('total', 'qualis');
            $total = (int) $counts->sum();

            return $qualisCodes->map(fn ($code) => [
                'qualis' => $code,
                'total' => (int) ($counts[$code] ?? 0),
                'percentage' => $total > 0
                    ? round(((int) ($counts[$code] ?? 0) / $total) * 100, 2)
                    : 0,
            ])->all();
        };

        $productionsPerYear = Production::query()
            ->selectRaw('year, COUNT(DISTINCT id) as total')
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn ($row) => [
                'year' => (int) $row->year,
                'total' => (int) $row->total,
            ])
            ->values();

        $productionSources = array_map(
            fn (ProductionSource $source) => $source->value,
            ProductionSource::cases(),
        );
        $productionSources[] = 'unknown';

        $sourceTotals = Production::query()
            ->selectRaw("COALESCE(source, 'unknown') as source, COUNT(*) as total")
            ->groupByRaw("COALESCE(source, 'unknown')")
            ->pluck('total', 'source');

        $facultySourceCounts = DB::table('users_productions as up')
            ->join('productions as p', 'p.id', '=', 'up.productions_id')
            ->join('users as u', 'u.id', '=', 'up.users_id')
            ->where('u.type', UserType::PROFESSOR->value)
            ->selectRaw("u.id as user_id, COALESCE(p.source, 'unknown') as source, COUNT(DISTINCT p.id) as total")
            ->groupBy('u.id')
            ->groupByRaw("COALESCE(p.source, 'unknown')")
            ->get()
            ->groupBy('user_id');

        $facultyProductionsBySource = $faculty->map(function (array $professor) use ($facultySourceCounts, $productionSources) {
            $counts = $facultySourceCounts->get($professor['id'], collect())->pluck('total', 'source');
            $row = [
                'id' => $professor['id'],
                'name' => $professor['name'],
                'productions_by_source' => [],
            ];
            foreach ($productionSources as $source) {
                $row['productions_by_source'][$source] = (int) ($counts[$source] ?? 0);
            }

            return $row;
        })->values();

        return response()->json([
            'faculty' => $faculty,
            'faculty_summary' => [
                'faculty_count' => $facultyCount,
                'faculty_with_productions_count' => $facultyWithProductionsCount,
                'mean' => $mean === null ? null : round($mean, 2),
                'median' => $median,
                'standard_deviation' => $standardDeviation === null ? null : round($standardDeviation, 2),
                'minimum' => $facultyCount > 0 ? $facultyTotals->first() : null,
                'maximum' => $facultyCount > 0 ? $facultyTotals->last() : null,
            ],
            'conferences_by_qualis' => $byQualis('conference'),
            'journals_by_qualis' => $byQualis('journal'),
            'productions_per_year' => $productionsPerYear,
            'productions_by_source' => collect($productionSources)
                ->map(fn (string $source) => [
                    'source' => $source,
                    'total' => (int) ($sourceTotals[$source] ?? 0),
                ])
                ->all(),
            'faculty_productions_by_source' => $facultyProductionsBySource,
        ]);
    }

    public function studentCountPerArea(Request $request): array
    {
        // return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
        //         'data' => [12, 3, 5,]];

        $data = $request->validate([
            'selectedFilter' => 'nullable|string|in:mestrando,doutorando,completed',
        ]);

        $filter = $data['selectedFilter'] ?? null;

        return User::userCountPerArea($filter);
    }

    public function defensesPerYear()
    {
        return response()->json($this->dashboardService->getDefensesPerYear());
    }

    public function allProfessors()
    {
        $professors = User::where('type', UserType::PROFESSOR)
            ->select('id', 'name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $professors,
        ]);
    }

    // função produtividade professor
    public function professorProduction(Request $request, $professorId)
    {
        $validated = $request->validate([
            'anoInicial'    => 'nullable|int',
            'anoFinal'      => 'nullable|int',
            'publisher_type' => 'nullable|string|in:journal,conference',
        ]);

        $anoAtual   = (int) date('Y');
        $anoInicial = $validated['anoInicial'] ?? $anoAtual - 2;
        $anoFinal   = $validated['anoFinal'] ?? $anoAtual;

        if ($anoInicial >= $anoFinal) {
            throw ValidationException::withMessages(['anoInicial' => 'Ano inicial não pode ser maior ou igual ao ano final!']);
        }

        $professor = User::where('id', $professorId)
            ->where('type', UserType::PROFESSOR)
            ->firstOrFail();

        $qualisInput = $request->input('qualis');
        $qualis_codes = $qualisInput ? explode(',', $qualisInput) : null;

        $resultado = $this->dashboardService->getProfessorProduction(
            $professorId,
            $anoInicial,
            $anoFinal,
            $validated['publisher_type'] ?? null,
            $qualis_codes
        );

        return response()->json([
            'professor'   => $professor->name,
            'productions' => $resultado,
        ]);
    }

    public function enrollmentsPerYear()
    {
        return response()->json($this->dashboardService->getEnrollmentsPerYear());
    }

    public function studentCountPerCourse()
    {
        return response()->json($this->dashboardService->getStudentCountPerCourse());
    }

    /**
     * Get summary of pending items requiring admin action.
     */
    public function pendingSummary(): \Illuminate\Http\JsonResponse
    {
        $registrations = User::where('is_approved', false)
            ->where('type', UserType::PROFESSOR)
            ->count();

        $studentRegistrations = User::whereNotNull('registration_requested_at')
            ->where('type', UserType::STUDENT)
            ->count();

        $adminRequests = User::where('admin_status', 'pending')->count();

        $publishers = \App\Models\Publishers::onlyPending()->count();

        return response()->json([
            'registrations' => $registrations,
            'student_registrations' => $studentRegistrations,
            'admin_requests' => $adminRequests,
            'publishers' => $publishers,
            'total' => $registrations + $studentRegistrations + $adminRequests + $publishers
        ]);
    }
}
