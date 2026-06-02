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
        Schema::table('stratum_qualis', function (Blueprint $table) {
            // Adds the unique constraint
            $table->unique(['type', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stratum_qualis', function (Blueprint $table) {
            // Removes the constraint if rollback
            $table->dropUnique(['type', 'code']);
        });
    }
};
