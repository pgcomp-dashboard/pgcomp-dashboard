<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Conference;
use App\Models\Journal;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;
use Illuminate\Support\Facades\DB;


use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function advisors(Request $request)
    {
        $userType = $request->input('user_type');
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            //->whereHas('advisedes') // não lista professores sem orientandos!
            ->withCount(['advisedes' => function (Builder $belongsToMany) use ($userType) {
                if ($userType === 'doutorando') {
                    $belongsToMany->where('course_id', 2);
                } elseif ($userType === 'mestrando') {
                    $belongsToMany->where('course_id', 1);
                } elseif ($userType === 'completed') {
                    $belongsToMany->whereNotNull('defended_at');
                }
            }])
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, 'advisedes_count']);
        });
    }

  public function allProfessors()
{
    $professors = User::where('type', UserType::PROFESSOR)
        ->select('id', 'name')  
        ->get();
    
    return response()->json([
        'status' => 'success',
        'data' => $professors
    ]);
}


//função produtividade professor
public function professorProduction(Request $request, $professorId)
{
    // Define valores padrões
    $anoAtual = (int) date('Y');
    $anoInicial = $validated['anoInicial'] ?? ($anoAtual - 2); // 2 anos atrás padrão
    $anoFinal = $validated['anoFinal'] ?? $anoAtual; // Ano atual por padrão

    // Verifica se o professor existe
    $professor = User::where('id', $professorId)
                    ->where('type', UserType::PROFESSOR)
                    ->first();
    
    if (!$professor) {
        return response()->json([
            'error' => 'Professor não encontrado'
        ], 404);
    }

    // Faz a busca das produções do professor por ano
    $producoes = Production::join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
        ->where('users_productions.users_id', $professorId)
        ->whereBetween('productions.year', [$anoInicial, $anoFinal])
        ->selectRaw('productions.year as ano, COUNT(*) as total')
        ->groupBy('productions.year')
        ->orderBy('productions.year')
        ->get();
    
    // [ano => total]
    $resultado = [];
    foreach (range($anoInicial, $anoFinal) as $ano) {
        $producaoAno = $producoes->firstWhere('ano', $ano);
        $resultado[$ano] = $producaoAno ? $producaoAno->total : 0;
    }
    
    return response()->json([
        'professor' => $professor->name,
        'anos' => array_keys($resultado),
        'producoes' => array_values($resultado)
    ]);
}

    //matriculasPorAno
public function matriculasPorAno()
{
    $anoAtual = date('Y');
    $matriculas = User::where('type', UserType::STUDENT)
        ->whereRaw('LENGTH(registration) >= 4') 
        ->selectRaw('CAST(SUBSTRING(registration, 1, 4) AS UNSIGNED) as ano, COUNT(*) as total')
        ->groupBy('ano')
        ->havingRaw('ano >= 2000 AND ano <= ?', [$anoAtual])
        ->orderBy('ano', 'desc')
        ->pluck('total', 'ano');  

    return response()->json([
        'Ano' => array_keys($matriculas->toArray()),
        'QntdAlunos' => array_values($matriculas->toArray())
    ]);
}
    public function programName()
    {
        // TODO: Retornar o JSON com o nome do programa
        //{
        //  "sigla": "PGCOMP/IC",
        //  "nome": "Programa de pós-graduação em ciência da computação"
        //}

        /**
         * @todo vamos tentar usar o padrão de nomes do banco de dados para evitar renomear.
         */
        $keyReturnPattern = ['sigla', "nome"];
        $keysSearch = ['name', 'description'];
      //  $program = new Program();
        //return $program->findAllCoursesByColumns($keysSearch, $keyReturnPattern);
        return "ok";
    }

    public function totalProductionsPerYear(Request $request)
    {
        $publisher_type = match ($request->input("publisher_type")){
            'journal' => Journal::class,
            'conference' => Conference::class,
            default => null
        };

        $filter = match ($request->input('user_type')) {
            'docente' => ['professor', null],
            'mestrando' => ['student', '1'],
            'doutorando' => ['student', '2'],
            default => [null, null]
        };

        return Production::totalProductionsPerYear(
            user_type: $filter[0],
            course_id: $filter[1],
            publisher_type: $publisher_type
        );
    }

    public function studentsProductions(Request $request)
    {
        $publisherType = match ($request->input('publisher_type')){
            'journal' => Journal::class,
            'conference' => Conference::class,
            default => null
        };

        $production = new Production();
        return $production->totalProductionsPerCourse($publisherType);
    }

    public function productionPerQualis(Request $request) {

        $publisher_type = match ($request->input('publisher_type')){
            'journal' => Journal::class,
            'conference' => Conference::class,
            default => null
        };

        $filter = match ($request->input('user_type')) {
            'docente' => ['professor', null],
            'mestrando' => ['student', '1'],
            'doutorando' => ['student', '2'],
            default => [null, null]
        };

        $qualis = new StratumQualis();
        return $qualis->totalProductionsPerQualis(user_type: $filter[0], course_id: $filter[1], publisher_type: $publisher_type);
    }

    public function studentCountPerSubArea(Request $request): array
    {
        $data = $request->validate([
            'selectedFilter' => 'nullable|string|in:mestrando,doutorando,completed',
        ]);

        $filter = $data['selectedFilter'] ?? null;

        return User::userCountPerSubArea($filter);
    }

    public function studentCountPerArea(Request $request): array
    {
        $data = $request->validate([
            'selectedFilter' => 'nullable|string|in:mestrando,doutorando,completed',
        ]);

        $filter = $data['selectedFilter'] ?? null;

        return User::userCountPerArea($filter);
    }

    public function defensesPerYear(Request $request)
    {
        $data = $request->validate([
            'filter' => 'nullable|string|in:mestrado,doutorado',
        ]);

        $filter = $data['filter'] ?? null;

        $baseQuery = match ($filter) {
            "mestrado" => User::mestrandos(),
            "doutorado" => User::doutorandos(),
            default => User::query(),
        };

        $counts = $baseQuery
            ->whereNotNull('defended_at')
            ->selectRaw('YEAR(defended_at) AS year, COUNT(*) AS total')
            ->groupBy('year')
            ->orderBy('year')
            ->pluck('total', 'year');

        return response()->json($counts);
    }

    public function enrollmentsPerYear(Request $request)
    {
        $data = $request->validate([
            'filter' => 'nullable|string|in:mestrado,doutorado',
        ]);

        $filter = $data['filter'] ?? null;

        $baseQuery = match ($filter) {
            "mestrado" => User::mestrandos(),
            "doutorado" => User::doutorandos(),
            default => User::query()->where('type', UserType::STUDENT),
        };

        $counts = $baseQuery
            ->whereNotNull('registration')
            ->selectRaw('SUBSTRING(registration, 1, 4) AS year, COUNT(*) AS total')
            ->groupBy('year')
            ->orderBy('year')
            ->pluck('total', 'year')
            ->filter(function ($value, $year) {
                $year = (int)$year;
                $currentYear = (int)date('Y');
                return $year <= $currentYear;
            });

        return response()->json([
            'years' => array_keys($counts->toArray()),
            'data' => array_values($counts->toArray())
        ]);
    }
}