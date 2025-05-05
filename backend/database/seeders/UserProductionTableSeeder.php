<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserProductionTableSeeder extends Seeder
{
    static array $usersId = [101, 102, 103, 104, 105, 101, 201, 107, 108, 201, 202, 204];
    static array $productionsId = [1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8];

    public function run()
    {
        $counter = 0;
        foreach (self::$usersId as $userId) {
            DB::table('users_productions')->insert([
                'users_id' => $userId,
                'productions_id' => self::$productionsId[$counter]
            ]);
            $counter++;
        }
    }
}
