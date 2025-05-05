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
        Schema::create('journals', function (Blueprint $table) {
            $table->id();
            $table->string('issn')->index();
            $table->string('name');
            $table->string('sbc_adjustment')->nullable();
            $table->string('scopus_url')->nullable();
            $table->string('percentile')->nullable();
            $table->string('last_qualis')->nullable();
            $table->dateTime('update_date')->nullable();
            $table->dateTime('tentative_date')->nullable();
            $table->string('logs')->nullable();
            $table->foreignId('stratum_qualis_id')->nullable()->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('journals');
    }
};
