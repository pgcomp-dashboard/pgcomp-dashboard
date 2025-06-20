<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Publishers;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DashboardController extends Controller
{
    public function advisors(Request $request)
    {
        $userType = $request->input('user_type');
        $attributes = ['id', 'name'];

        // Define o nome do curso para a contagem (Mestrado/Doutorado)
        $courseNameForCount = null;
        if ($userType === 'doutorando') {
            $courseNameForCount = 'Doutorado';
        } elseif ($userType === 'mestrando') {
            $courseNameForCount = 'Mestrado';
        }

        // Obtém todos os professores.
        $advisors = User::where('type', UserType::PROFESSOR)->get($attributes);

        // Mapeia sobre cada professor para obter a contagem de alunos orientados.
        $advisorsWithCounts = $advisors->map(function ($advisor) use ($courseNameForCount, $userType, $attributes) {
            $count = 0;

            if ($userType === 'completed') {
                // Usa o novo método para contar alunos defendidos.
                $count = User::countDefendedAdvisedStudentsByProfessor($advisor->id, $courseNameForCount);
            } else {
                // Reutiliza o método existente para mestrandos/doutorandos (que já contam ativos) ou todos ativos.
                $countsByCourse = User::countAdvisedStudentsByProfessorAndCourse($advisor->id, $courseNameForCount);
                $count = array_sum($countsByCourse);
            }

            // Retorna os atributos do professor com a contagem.
            return $advisor->only([...$attributes]) + ['advisedes_count' => $count];
        });

        // Ordena os resultados e retorna.
        return $advisorsWithCounts->sortByDesc('advisedes_count')->values();
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

        $result = Production::totalProductionsPerYear(
            user_type: $filter[0],
            course_id: $filter[1],
            publisher_type: $publisher_type
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

        $production = new Production;

        return $production->totalProductionsPerYear(
            user_type: $filter[0],
            course_id: $filter[1],
            publisher_type: $publisher_type
        );
    }

    // public function productionPerQualis()
    // {
    // TODO: Retornar lista de anos no JSON
    // years = ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015',
    // '2016', '2017', '2018', '2019', '2020', '2021', '2022']
    // TODO: Retornar JSON na estrutura de lista abaixo
    //        [
    //                {
    //                    label: 'A1',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'A2',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'A3',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'A4',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'B1',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'B2',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'B3',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                }, {
    //                      label: 'B4',
    //                    data: generateValues(NUMBER_OF_ITEMS), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
    //                },
    //            ]
    // $qualis = new StratumQualis();
    // return $qualis->totalProductionsPerQualis(['years', 'data']);
    // }

    public function productionPerQualis(Request $request)
    {

        $publisher_type = $request->input('publisher_type');

        $filter = match ($request->input('user_type')) {
            'docente' => ['professor', null],
            'mestrando' => ['student', '1'],
            'doutorando' => ['student', '2'],
            default => [null, null]
        };

        $qualis = new StratumQualis;

        return $qualis->totalProductionsPerQualis(user_type: $filter[0], course_id: $filter[1], publisher_type: $publisher_type);
    }

    public function studentCountPerArea(Request $request): array
    {
        // return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
        //        'data' => [12, 3, 5,]];

        $data = $request->validate([
            'selectedFilter' => 'nullable|string|in:mestrando,doutorando,completed',
        ]);

        $filter = $data['selectedFilter'] ?? null;

        return User::userCountPerArea($filter);
    }

    public function defensesPerYear()
    {
        $mestrado = User::mestrandos()
            ->whereNotNull('defended_at')
            ->selectRaw('YEAR(defended_at) AS year, COUNT(*) AS total')
            ->groupBy('year')
            ->pluck('total', 'year');

        $doutorado = User::doutorandos()
            ->whereNotNull('defended_at')
            ->selectRaw('YEAR(defended_at) AS year, COUNT(*) AS total')
            ->groupBy('year')
            ->pluck('total', 'year');

        $allYears = collect($mestrado->keys())->merge($doutorado->keys())->unique()->sort();

        $result = $allYears->mapWithKeys(function ($year) use ($mestrado, $doutorado) {
            return [
                $year => [
                    'year' => $year,
                    'mestrado' => $mestrado[$year] ?? 0,
                    'doutorado' => $doutorado[$year] ?? 0,
                ],
            ];
        });

        return response()->json($result->values());
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
            'anoInicial' => 'nullable|int',
            'anoFinal' => 'nullable|int',
        ]);
        // Define valores padrões
        $anoAtual = (int) date('Y');
        $anoInicial = $validated['anoInicial'] ?? $anoAtual - 2; // 2 anos atrás padrão
        $anoFinal = $validated['anoFinal'] ?? $anoAtual; // Ano atual por padrão

        if ($anoInicial >= $anoFinal) {
            throw ValidationException::withMessages(['anoInicial não pode ser maior ou igual ao ano final!']);
        }

        // Verifica se o professor existe
        $professor = User::where('id', $professorId)
            ->where('type', UserType::PROFESSOR)
            ->first();

        if (! $professor) {
            return response()->json(
                [
                    'error' => 'Professor não encontrado',
                ],
                404
            );
        }

        // Faz a busca das produções do professor por ano
        $producoes = Production::join(
            'users_productions',
            'productions.id',
            '=',
            'users_productions.productions_id'
        )
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
            'productions' => $resultado,
        ]);
    }

    public function enrollmentsPerYear()
    {
        $anoAtual = date("Y");

        $mestrado = User::mestrandos()
            ->whereRaw("LENGTH(registration) >= 4")
            ->selectRaw("CAST(SUBSTRING(registration, 1, 4) AS UNSIGNED) as year, COUNT(*) as total")
            ->groupBy("year")
            ->havingRaw("year >= 2000 AND year <= ?", [$anoAtual])
            ->pluck("total", "year");

        $doutorado = User::doutorandos()
            ->whereRaw("LENGTH(registration) >= 4")
            ->selectRaw("CAST(SUBSTRING(registration, 1, 4) AS UNSIGNED) as year, COUNT(*) as total")
            ->groupBy("year")
            ->havingRaw("year >= 2000 AND year <= ?", [$anoAtual])
            ->pluck("total", "year");

        $allYears = collect($mestrado->keys())->merge($doutorado->keys())->unique()->sort();

        $result = $allYears->mapWithKeys(function ($year) use ($mestrado, $doutorado) {
            return [
                $year => [
                    'year' => $year,
                    'mestrado' => $mestrado[$year] ?? 0,
                    'doutorado' => $doutorado[$year] ?? 0,
                ],
            ];
        });

        return response()->json($result->values());
    }

    public function studentCountPerCourse()
    {
        $courses = Course::withCount([
            // total students
            'students',
            // only those completed
            'students as completed_count' => function($q){
                $q->whereNotNull('defended_at');
            },
            // only those still in progress
            'students as in_progress_count' => function($q){
                $q->whereNull('defended_at');
            },
        ])->get(['name']);

        $result = $courses->mapWithKeys(function($c){
            return [
                $c->name => [
                    'in_progress' => $c->in_progress_count,
                    'completed'   => $c->completed_count,
                ]
            ];
        });

        return response()->json($result);
    }
}
