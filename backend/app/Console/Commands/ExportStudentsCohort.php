<?php

namespace App\Console\Commands;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Console\Command;

class ExportStudentsCohort extends Command
{
    protected $signature = 'students:export-cohort
        {year=2026 : Ano de matrícula (4 primeiros dígitos de registration)}
        {--output=students-cohort.json : Nome do arquivo em storage/app/exports}';

    protected $description = 'Exporta alunos de uma matrícula (ano) do banco local para JSON, para importar em produção via students:import-cohort';

    public function handle(): int
    {
        $year = $this->argument('year');

        if (! preg_match('/^\d{4}$/', $year)) {
            $this->error('Ano inválido. Use 4 dígitos, ex: 2026.');

            return self::FAILURE;
        }

        $students = User::where('type', UserType::STUDENT->value)
            ->whereRaw('SUBSTRING(registration, 1, 4) = ?', [$year])
            ->with(['course', 'area'])
            ->orderBy('registration')
            ->get();

        if ($students->isEmpty()) {
            $this->warn("Nenhum aluno encontrado com matrícula iniciando em {$year}.");

            return self::SUCCESS;
        }

        $payload = $students->map(function (User $student) {
            return array_filter([
                'registration' => $student->registration,
                'name' => $student->name,
                'course_name' => $student->course?->name,
                'area_name' => $student->area?->area,
                'email' => $student->email,
                'lattes_url' => $student->lattes_url,
                'defended_at' => $student->defended_at,
            ], fn ($value) => $value !== null);
        })->values();

        $dir = storage_path('app/exports');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $jsonPath = $dir.DIRECTORY_SEPARATOR.$this->option('output');
        $jsonEncoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        file_put_contents($jsonPath, $jsonEncoded);

        $b64Path = preg_replace('/\.json$/', '.b64', $jsonPath);
        file_put_contents($b64Path, base64_encode(json_encode($payload, JSON_UNESCAPED_UNICODE)));

        $this->info("Exportados {$students->count()} aluno(s) com matrícula {$year}.");
        $this->table(
            ['registration', 'name', 'course_name'],
            $payload->map(fn ($s) => [$s['registration'] ?? '-', $s['name'] ?? '-', $s['course_name'] ?? '-'])->toArray()
        );
        $this->newLine();
        $this->line("  JSON:   {$jsonPath}");
        $this->line("  Base64: {$b64Path} (use no --data do comando students:import-cohort em produção)");

        return self::SUCCESS;
    }
}
