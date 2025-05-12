<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubareaTableSeeder extends Seeder
{
    static array $subareasName = ['Computação Visual',
        'Sistemas de Informação, Banco de Dados e Web',
        'Computação de Alto Desempenho',
        'Rede de Computadores'];

    static array $areaId = [1, 1, 2, 2];

    public function run()
    {
        $counter = 0;
        foreach (self::$subareasName as $subareaName) {
            DB::table('subareas')->insert([
                'subarea_name' => $subareaName,
                'area_id' => self::$areaId[$counter]
            ]);
            $counter++;
        }
    }
}
