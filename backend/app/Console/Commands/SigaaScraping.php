<?php

namespace App\Console\Commands;

use App\Domain\Sigaa\StudentScraping;
use App\Domain\Sigaa\TeacherScraping;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SigaaScraping extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sigaa:scraping {courseId=1820 : ID do curso no site SIGAA}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'SIGAA Web Scraping';

    /**
     * Execute the console command.
     * @throws Exception
     */
    public function handle(): int
    {
        // @see https://sigaa.ufba.br/sigaa/public/programa/lista.jsf
        $courseId = $this->argument('courseId');
        if (! is_numeric($courseId) || $courseId <= 0) {
            $this->error('Informe um ID de curso válido');
            return 1;
        }

        $teacherScraping = new TeacherScraping();
        try {
            $teachers = $teacherScraping->scrapingByCourse((int)$courseId);
            Storage::put("teachers-{$courseId}.json", json_encode($teachers));
            $this->createOrUpdateTeachers($teachers);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        $studentScraping = new StudentScraping();
        try {
            $students = $studentScraping->scrapingByCourse((int)$courseId);
            Storage::put("students-{$courseId}.json", json_encode($students));
            $this->createOrUpdateStudents($students);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        return 0;
    }

    private function createOrUpdateTeachers(array $teachers): void
    {
        foreach ($teachers as $teacher) {
            try {
                $user = User::createOrUpdateTeacher($teacher);
                $this->info("Docente {$user->name} cadastrado/atualizado com sucesso");
            } catch (ValidationException $exception) {
                $msg = "Erro ao cadastrar/atualizar docente {$teacher['name']}: {$exception->getMessage()}";
                $this->error($msg);
                Log::error($msg, $teacher);
            }
        }
    }

    private function createOrUpdateStudents(array $students): void
    {
        foreach ($students as $student) {
            try {
                $user = \DB::transaction(function () use ($student) {
                    $user = User::createOrUpdateStudent($student);
                    $user->advisors()->sync($this->getAdvisorIds($student['teachers']));

                    return $user;
                });

                $this->info("Discente {$user->name} cadastrado/atualizado com sucesso");
            } catch (ValidationException $exception) {
                $msg = "Erro ao cadastrar/atualizar discente {$student['name']}: {$exception->getMessage()}";
                $this->error($msg);
                Log::error($msg, $student);
            }
        }
    }

    private function getAdvisorIds(array $teachers): array
    {
        $advisorIds = [];
        foreach ($teachers as $teacher) {
            if (empty($teacher['siape'])) {
                continue;
            }
            $teacherModel = User::where('siape', $teacher['siape'])->first();
            if (empty($teacherModel)) {
                $this->warn(
                    "Docente {$teacher['name']} ({$teacher['relation_type']} - {$teacher['siape']}) não encontrado!"
                );
                $teacherModel = User::createOrUpdateTeacher($teacher);
            }
            $advisorIds[$teacherModel->id] = ['relation_type' => $teacher['relation_type']];
        }

        return $advisorIds;
    }
}
