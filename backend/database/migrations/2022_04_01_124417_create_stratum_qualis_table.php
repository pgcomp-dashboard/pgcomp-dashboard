<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stratum_qualis', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->integer('score');
            $table->timestamps();
        });

        DB::table('stratum_qualis')->insert([
            ['code' => 'A1', 'score' => 10],
            ['code' => 'A2', 'score' => 9],
            ['code' => 'A3', 'score' => 8],
            ['code' => 'A4', 'score' => 7],
            ['code' => 'B1', 'score' => 4],
            ['code' => 'B2', 'score' => 3],
            ['code' => 'B3', 'score' => 2],
            ['code' => 'B4', 'score' => 1],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stratum_qualis');
    }
};
