<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Production;

class DashboardController extends Controller
{

    public function nomePrograma()
    {
        // TODO: Retornar o JSON com o nome do programa
        //{
        //  "sigla": "PGCOMP/IC",
        //  "nome": "Programa de pós-graduação em ciência da computação"
        //}
    }


    public function totalProducoes()
    {
        // TODO: Retornar lista de anos no JSON
        // TODO: Retornar JSON na estrutura de lista abaixo
        //{
        //  'years': ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        //  'data': generateValues(anos), TODO: Aqui é 1 valor por ano, deve ter o mesmo tamanho dos anos
        //}
    }


    public function qualis()
    {
        // TODO: Retornar lista de anos no JSON
        // years = ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
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
    }


    public function producoesDiscentes()
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
    }


    public function discentesArea()
    {
        //{
        //  fields: ['CG', 'Análise de Dados', 'I.A',],
        //  data: [12, 3, 5,], TODO: Aqui é 1 valor por area, deve ter o mesmo tamanho de areas
        //}
    }


    public function discentesSubarea()
    {
        //{
        //  subfields: ['CG', 'Análise de Dados', 'I.A',],
        //  data: [12, 3, 5,], TODO: Aqui é 1 valor por subarea, deve ter o mesmo tamanho de subareas
        //}
    }

    public function advisors()
    {
        $attributes = ['id', 'name'];
        $data = User::where('type', UserType::PROFESSOR)
            //->whereHas('advisedes') TODO: Se não serve deleta
            ->withCount('advisedes')
            ->get($attributes);

        return $data->transform(function ($item) use ($attributes) {
            return $item->only([...$attributes, 'advisedes_count']);
        });
    }
}
