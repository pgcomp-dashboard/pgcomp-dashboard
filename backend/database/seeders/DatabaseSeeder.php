<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        $this->call(StratumQualisSeeder::class);
        // $this->call(AreaTableSeeder::class);
        // $this->call(SubareaTableSeeder::class);
        // $this->call(UserTableSeeder::class);
        // $this->call(JournalTableSeeder::class);
        // $this->call(ProductionTableSeeder::class);
        // $this->call(UserProductionTableSeeder::class);
    }
}
