<?php

namespace App\Console\Commands;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Console\Command;

class ExportStudents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'export:students {output=students.csv : File to output}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export students data into a CSV file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $outputFileName = $this->argument('output');

        $outputFile = fopen($outputFileName, 'w');

        $students = User::whereType(UserType::STUDENT->value)->get();

        fputcsv($outputFile, ['siape_orientador', 'nome_orientador', 'matricula_aluno', 'nome_aluno', 'coorientadores']);

        $this->withProgressBar($students, function ($student) use ($outputFile) {
            $advisor = $student->advisors()->first();

            $coadvisors = $student->coadvisors()->get()->map(function ($coadvisor) {
                return $coadvisor->name;
            });

            fputcsv($outputFile, [
                $advisor ? $advisor->siape : 'Nulo',
                $advisor ? $advisor->name : 'Nulo',
                $student->registration,
                $student->name,
                implode(', ', $coadvisors->toArray()),
            ]);
        });

        fclose($outputFile);
    }
}
