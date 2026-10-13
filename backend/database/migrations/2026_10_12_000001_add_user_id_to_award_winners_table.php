<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('award_winners', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('award_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        DB::table('award_winners')
            ->select(['id', 'name', 'recipient_type'])
            ->orderBy('id')
            ->chunkById(500, function ($winners) {
                foreach ($winners as $winner) {
                    if (! in_array($winner->recipient_type, ['professor', 'student'], true)) {
                        continue;
                    }

                    $matchingUsers = DB::table('users')
                        ->where('type', $winner->recipient_type)
                        ->whereRaw('LOWER(TRIM(name)) = LOWER(TRIM(?))', [$winner->name])
                        ->limit(2)
                        ->pluck('id');

                    if ($matchingUsers->count() === 1) {
                        DB::table('award_winners')
                            ->where('id', $winner->id)
                            ->update(['user_id' => $matchingUsers->first()]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('award_winners', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
