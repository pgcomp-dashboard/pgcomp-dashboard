<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Conference;
use App\Models\Journal;
use App\Models\Production;
use App\Models\StratumQualis;
use App\Models\User;

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
        //{
        //  'years': ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015',
        // '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        //  'data': generateValues(anos), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //}
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
        // TODO: Retornar lista de anos no JSON
        // TODO: Retornar JSON na estrutura de lista abaixo
        //{
        //  "years": ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        //  "data": {
        //      'label': 'Mestrado',
        //      'data': generateValues(NUMBER_OF_ITEMS),TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //  },
        //  {
        //      'label': 'Doutorado',
        //      'data': generateValues(NUMBER_OF_ITEMS),TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //  }
        //}
        $publisherType = match ($request->input('publisher_type')){
            'journal' => Journal::class,
            'conference' => Conference::class,
            default => null
        };

        $production = new Production();
        return $production->totalProductionsPerCourse($publisherType);
    }

    //public function productionPerQualis()
    //{
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
        //$qualis = new StratumQualis();
        //return $qualis->totalProductionsPerQualis(['years', 'data']);
    //}

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
        //return ['fields' => ['CG', 'Análise de Dados', 'I.A',],
        //        'data' => [12, 3, 5,]];

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

        // returns e.g. { "2019": 13, "2020": 23, "2021": 24, ... }
        return response()->json($counts);
    }
}
