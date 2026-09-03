<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\Defense;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MigrateLegacyDefenses extends Command
{
    protected $signature = 'defenses:migrate-legacy {--dry-run : Simula a migração sem gravar nada}';

    protected $description = 'Copia users.defended_at para a tabela defenses (o campo antigo é mantido como fallback)';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $typeByCourseId = Course::pluck('name', 'id')->map(fn (string $name) => match ($name) {
            'Mestrado' => Defense::TYPE_MESTRADO,
            'Doutorado' => Defense::TYPE_DOUTORADO,
            default => null,
        });

        $legacyCount = User::whereNotNull('defended_at')->count();
        $this->info(($dryRun ? '[DRY-RUN] ' : '')."Migrando {$legacyCount} defesa(s) de users.defended_at para defenses...");

        $created = 0;
        $updated = 0;
        $noCourse = 0;

        $backfill = function () use ($typeByCourseId, $dryRun, &$created, &$updated, &$noCourse) {
            User::whereNotNull('defended_at')
                ->orderBy('id')
                ->chunkById(200, function ($users) use ($typeByCourseId, $dryRun, &$created, &$updated, &$noCourse) {
                    foreach ($users as $user) {
                        $type = $user->course_id ? $typeByCourseId->get($user->course_id) : null;

                        if ($user->course_id === null) {
                            $noCourse++;
                        }

                        if ($dryRun) {
                            $exists = Defense::where('user_id', $user->id)
                                ->where('course_id', $user->course_id)
                                ->exists();
                            $exists ? $updated++ : $created++;

                            continue;
                        }

                        $defense = Defense::updateOrCreate(
                            ['user_id' => $user->id, 'course_id' => $user->course_id],
                            ['defended_at' => $user->defended_at, 'type' => $type],
                        );

                        $defense->wasRecentlyCreated ? $created++ : $updated++;
                    }
                });
        };

        $dryRun ? $backfill() : DB::transaction($backfill);

        $migratedCount = Defense::count();

        $this->newLine();
        $this->line("  Criadas:      {$created}");
        $this->line("  Atualizadas:  {$updated}");
        $this->line("  Sem curso (course_id/type = NULL): {$noCourse}");
        $this->line("  Total users.defended_at: {$legacyCount}");
        $this->line("  Total defenses:          {$migratedCount}");

        Log::info('defenses:migrate-legacy concluído', [
            'dry_run' => $dryRun,
            'created' => $created,
            'updated' => $updated,
            'without_course' => $noCourse,
            'legacy_count' => $legacyCount,
            'defenses_count' => $migratedCount,
        ]);

        if (! $dryRun && $migratedCount < $legacyCount) {
            $this->error('Há menos linhas em defenses do que users com defended_at — investigue antes de remover o campo antigo.');

            return self::FAILURE;
        }

        $this->info(($dryRun ? '[DRY-RUN] ' : '').'Migração concluída. O campo users.defended_at foi preservado.');

        return self::SUCCESS;
    }
}
