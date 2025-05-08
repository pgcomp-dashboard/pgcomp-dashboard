<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('publishers', function (Blueprint $table) {
            $table->id();
            $table->string('initials')->nullable()->index();
            $table->string('name');
            $table->enum('publisher_type', ['conference', 'journal']);
            $table->string('issn')->nullable()->index();
            $table->string('scopus_url')->nullable();
            $table->string('sbc_adjustment')->nullable();
            $table->string('percentile')->nullable();
            $table->dateTime('update_date')->nullable();
            $table->dateTime('tentative_date')->nullable();
            $table->string('logs')->nullable();

            $table->foreignId('stratum_qualis_id')->nullable()->constrained('stratum_qualis');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publishers');
    }
};
