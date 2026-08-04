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
        Schema::table('productions', function (Blueprint $table) {
            $table->unsignedBigInteger('original_publisher_id')->nullable()->after('publisher_id');
            
            $table->foreign('original_publisher_id')
                  ->references('id')
                  ->on('publishers')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            $table->dropForeign(['original_publisher_id']);
            $table->dropColumn('original_publisher_id');
        });
    }
};