<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Production;

class ProductionsController extends Controller
{
    public function totalProductionsPerYear()
    {
        // TODO: Retornar lista de anos no JSON
        // TODO: Retornar JSON na estrutura de lista abaixo
        //{
        //  'years': ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015',
        // '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        //  'data': generateValues(anos), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //}

        $keyReturnPattern = ['years', 'data'];
        $productions = new Production();
        $data = $productions->totalProductionsPerYear();

        return [$keyReturnPattern[0] => $data[0], $keyReturnPattern[1] => $data[1]];
    }

    public function studentsProductions()
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
        $production = new Production();
        return $production->totalProductionsPerCourse(['year', 'data']);
    }
}
