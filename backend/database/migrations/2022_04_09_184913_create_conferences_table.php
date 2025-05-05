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
        Schema::create('conferences', function (Blueprint $table) {
            $table->id();
            $table->string('initials')->index();
            $table->string('name');
            $table->integer('category')->nullable();
            $table->string('link', 500)->nullable();
            $table->string('ce_indicated')->nullable();
            $table->string('h5')->nullable();
            $table->string('last_qualis')->nullable();
            $table->string('logs')->nullable();
            $table->string('h5_old')->nullable();
            $table->boolean('use_scholar')->nullable();
            $table->string('qualis_2016')->nullable();
            $table->foreignId('qualis_2016_id')->nullable()->constrained('stratum_qualis');
            $table->string('qualis_without_induction')->nullable();
            $table->foreignId('qualis_without_induction_id')->nullable()->constrained('stratum_qualis');
            $table->string('sbc_adjustment_or_event')->nullable();
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
        Schema::dropIfExists('conferences');
    }
};
