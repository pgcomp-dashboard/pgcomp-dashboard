<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\Course;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportStudentsCohort extends Command
{
    protected $signature = 'students:import-cohort
        {--file= : Caminho para o arquivo JSON exportado}
        {--data= : JSON em base64 (alternativa a --file, útil via dokku run)}
        {--dry-run : Simula a importação sem gravar nada}';

    protected $description = 'Faz upsert (por registration) de alunos exportados de outro ambiente, sem duplicar';

    public function handle(UserService $service): int
    {
        $json = $this->resolvePayload();

        if ($json === null) {
            $this->error('Informe --file=<caminho> ou --data=<base64>.');

            return self::FAILURE;
        }

        $records = json_decode($json, true);

        if (! is_array($records)) {
            $this->error('JSON inválido.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $courseNotFound = [];
        $areaNotFound = [];

        foreach ($records as $record) {
            if (empty($record['registration']) || empty($record['name'])) {
                $this->warn('Registro sem registration/name — pulado: '.json_encode($record, JSON_UNESCAPED_UNICODE));
                $skipped++;

                continue;
            }

            $data = array_filter([
                'registration' => $record['registration'],
                'name' => $record['name'],
                'email' => $record['email'] ?? null,
                'lattes_url' => $record['lattes_url'] ?? null,
                'defended_at' => $record['defended_at'] ?? null,
            ], fn ($value) => $value !== null);

            if (! empty($record['course_name'])) {
                $course = Course::where('name', $record['course_name'])->first();
                $course ? $data['course_id'] = $course->id : $courseNotFound[] = $record['course_name'];
            }

            if (! empty($record['area_name'])) {
                $area = Area::where('area', $record['area_name'])->first();
                $area ? $data['area_id'] = $area->id : $areaNotFound[] = $record['area_name'];
            }

            if ($dryRun) {
                $exists = User::where('registration', $data['registration'])->exists();
                $exists ? $updated++ : $created++;

                continue;
            }

            try {
                $user = DB::transaction(fn () => $service->createOrUpdateStudent($data));
                $user->wasRecentlyCreated ? $created++ : $updated++;
                $this->line(($user->wasRecentlyCreated ? 'Criado: ' : 'Atualizado: ')."{$user->name} ({$user->registration})");
            } catch (\Throwable $e) {
                $this->error("Erro ao importar {$record['name']} ({$record['registration']}): {$e->getMessage()}");
                Log::error('students:import-cohort falhou em um registro', ['record' => $record, 'error' => $e->getMessage()]);
                $skipped++;
            }
        }

        $this->newLine();
        $this->line(($dryRun ? '[DRY-RUN] ' : '')."Criados: {$created} | Atualizados: {$updated} | Pulados: {$skipped}");

        if ($courseNotFound) {
            $this->warn('Curso não encontrado em produção (course_id ficou vazio nesses casos): '.implode(', ', array_unique($courseNotFound)));
        }

        if ($areaNotFound) {
            $this->warn('Área não encontrada em produção (area_id ficou vazio nesses casos): '.implode(', ', array_unique($areaNotFound)));
        }

        Log::info('students:import-cohort concluído', [
            'dry_run' => $dryRun,
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'total' => count($records),
        ]);

        return self::SUCCESS;
    }

    private function resolvePayload(): ?string
    {
        if ($file = $this->option('file')) {
            if (! is_file($file)) {
                $this->error("Arquivo não encontrado: {$file}");

                return null;
            }

            return file_get_contents($file);
        }

        if ($data = $this->option('data')) {
            $decoded = base64_decode($data, true);

            if ($decoded === false) {
                $this->error('Valor de --data não é base64 válido.');

                return null;
            }

            return $decoded;
        }

        return null;
    }
}
