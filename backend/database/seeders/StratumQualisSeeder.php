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
            ['type' => 'journal', 'code' => 'A1', 'score' => 100],
            ['type' => 'journal', 'code' => 'A2', 'score' => 87.5],
            ['type' => 'journal', 'code' => 'A3', 'score' => 75],
            ['type' => 'journal', 'code' => 'A4', 'score' => 62.5],
            ['type' => 'journal', 'code' => 'B1', 'score' => 0],
            ['type' => 'journal', 'code' => 'B2', 'score' => 0],
            ['type' => 'journal', 'code' => 'B3', 'score' => 0],
            ['type' => 'journal', 'code' => 'B4', 'score' => 0],
            ['type' => 'journal', 'code' => 'C', 'score' => 0],
            ['type' => 'journal', 'code' => 'NI', 'score' => 0],
            ['type' => 'conference', 'code' => 'A1', 'score' => 50],
            ['type' => 'conference', 'code' => 'A2', 'score' => 43.75],
            ['type' => 'conference', 'code' => 'A3', 'score' => 37.5],
            ['type' => 'conference', 'code' => 'A4', 'score' => 31.25],
            ['type' => 'conference', 'code' => 'B1', 'score' => 0],
            ['type' => 'conference', 'code' => 'B2', 'score' => 0],
            ['type' => 'conference', 'code' => 'B3', 'score' => 0],
            ['type' => 'conference', 'code' => 'B4', 'score' => 0],
            ['type' => 'conference', 'code' => 'C', 'score' => 0],
            ['type' => 'conference', 'code' => 'NI', 'score' => 0],
        ];

        foreach ($data as $item) {
            StratumQualis::updateOrCreate(Arr::only($item, ['type', 'code']), $item);
        }
    }
}
