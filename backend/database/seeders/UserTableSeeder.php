<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nAllUsers = 281;
        $subarea = 0;
        $nAreas = 4;
        for ($counter = 1; $counter <= $nAllUsers; $counter++) {
            DB::table('users')
                ->where('id', '=', $counter)
                ->update(['subarea_id' => $subarea + 1]);
            $subarea = ($subarea + 1) % $nAreas;
        }
    }
}
