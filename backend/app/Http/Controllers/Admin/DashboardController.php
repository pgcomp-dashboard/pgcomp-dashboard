<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

        $adminRequests = User::where('admin_status', 'pending')->count();

        $publishers = \App\Models\Publishers::onlyPending()->count();

        return response()->json([
            'registrations' => $registrations,
            'admin_requests' => $adminRequests,
            'publishers' => $publishers,
            'total' => $registrations + $adminRequests + $publishers
        ]);
    }
}