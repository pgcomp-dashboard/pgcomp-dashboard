<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AreaTableSeeder extends Seeder
{

    static array $areasName = ['Computação aplicada', 'Sistemas computacionais'];

    public function run()
    {
        foreach (self::$areasName as $areaName) {
            DB::table('areas')->insert([
                'area_name' => $areaName,
                'program_id' => 1
            ]);
        }
    }
}
