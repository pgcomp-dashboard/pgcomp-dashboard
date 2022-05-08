<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\StratumQualis;
use App\Models\Conference;
use App\Models\Journal;
use App\Models\Production;
use Illuminate\Http\Request;

class QualisController extends Controller
{
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

        $publisher_type = match ($request->input("publisher_type")){
            'journal' => Journal::class,
            'conference' => Conference::class,
            default => null
        };
        
        $user_type = [
            "docente" => ["professor", null],
            "mestrando" => ["student", "1"],
            "doutorando" => ["student", "2"],
            null => [null,null]
        ];

        $filter = $user_type[$request->input("user_type")];
        
        $qualis = new StratumQualis();
        return $qualis->totalProductionsPerQualisNew(['years', 'data'], user_type: $filter[0], course_id: $filter[1], publisher_type: $publisher_type);
    }

}
