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
        Schema::table('users_productions', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('productions_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_productions', function (Blueprint $table) {
            Schema::dropIfExists('is_featured');
        });
    }
};
