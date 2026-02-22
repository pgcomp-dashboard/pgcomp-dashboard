<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('publisher_issns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publishers_id')->constrained()->cascadeOnDelete();
            $table->string('issn')->unique();
            $table->timestamps();
        });

        // Data migration: copy existing non-null ISSNs
        DB::table('publishers')
            ->whereNotNull('issn')
            ->orderBy('id')
            ->chunk(100, function ($publishers) {
                $inserts = [];
                foreach ($publishers as $publisher) {
                    $inserts[] = [
                        'publishers_id' => $publisher->id,
                        'issn' => $publisher->issn,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('publisher_issns')->insertOrIgnore($inserts);
            });

        // Drop the old column
        Schema::table('publishers', function (Blueprint $table) {
            $table->dropColumn('issn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publishers', function (Blueprint $table) {
            $table->string('issn')->nullable();
        });

        // Copy back one ISSN per publisher
        $issns = DB::table('publisher_issns')->get();
        foreach ($issns as $issnRecord) {
            DB::table('publishers')
                ->where('id', $issnRecord->publishers_id)
                ->whereNull('issn') // only keep the first one roughly
                ->update(['issn' => $issnRecord->issn]);
        }

        Schema::dropIfExists('publisher_issns');
    }
};
