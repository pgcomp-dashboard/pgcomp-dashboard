<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionTableSeeder extends Seeder
{
    static array $productionsName = ['t1', 't2', 't3', 't4',
        't5', 't6', 't7', 't8'];

    static array $year = [2017, 2017, 2017, 2018,
        2018, 2018, 2019, 2020];

    static array $journalsId = [1, 1, 2, 2, 3, 4, 4, 4];

    public function run()
    {
        $counter = 0;
        foreach (self::$productionsName as $productionName) {
            DB::table('productions')->insert([
                'title' => $productionName,
                'year' => self::$year[$counter],
                'journals_id' => self::$journalsId[$counter]
            ]);
            $counter++;
        }
    }
}
