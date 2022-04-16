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
        Schema::table('productions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('journals_id');
            $table->string('publisher_type')->nullable();
            $table->foreignId('publisher_id')->nullable();
            $table->index(['publisher_type', 'publisher_id']);
            $table->string('last_qualis')->nullable();
            $table->foreignId('stratum_qualis_id')->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('productions', function (Blueprint $table) {
            $table->foreignId('journals_id')->nullable()->constrained();
            $table->dropIndex(['publisher_type', 'publisher_id']);
            $table->dropColumn('publisher_type');
            $table->dropColumn('publisher_id');
            $table->dropColumn('last_qualis');
            $table->dropConstrainedForeignId('stratum_qualis_id');
        });
    }
};
