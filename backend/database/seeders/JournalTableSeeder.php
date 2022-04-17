<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JournalTableSeeder extends Seeder
{
    static array $journalsName = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6'];
    static array $stratumQualisId = [1, 1, 1, 2, 3, 3];

    public function run()
    {
        $counter = 0;
        foreach (self::$journalsName as $journalName) {
            DB::table('journals')->insert([
                'name' => $journalName,
                'stratum_qualis_id' => self::$stratumQualisId[$counter],
                'issn' => 't'
            ]);
            $counter++;
        }
    }
}
