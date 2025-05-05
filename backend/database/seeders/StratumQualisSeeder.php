<?php

namespace Database\Seeders;

use App\Models\StratumQualis;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class StratumQualisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = [
            ['code' => 'A1', 'score' => 100],
            ['code' => 'A2', 'score' => 90],
            ['code' => 'A3', 'score' => 80],
            ['code' => 'A4', 'score' => 70],
            ['code' => 'B1', 'score' => 40],
            ['code' => 'B2', 'score' => 30],
            ['code' => 'B3', 'score' => 20],
            ['code' => 'B4', 'score' => 10],
            ['code' => '-', 'score' => 0],
        ];

        foreach ($data as $item) {
            StratumQualis::updateOrCreate(Arr::only($item, ['code']), $item);
        }
    }
}
