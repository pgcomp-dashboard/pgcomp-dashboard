<?php

namespace App\Console\Commands\Scraping;

use App\Domain\Sigaa\StudentScraping;
use App\Enums\UserRelationType;
use App\Exceptions\IsProtectedException;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SigaaStudentsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:sigaa-students {programId=1820 : ID do curso no site SIGAA}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'SIGAA Web Scraping only for students';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $programId = $this->argument('programId');

        if (! is_numeric($programId) || (int) $programId <= 0) {
            $this->error('Informe um ID de curso válido');

            return 1;
        }

        $studentScraping = new StudentScraping;

        try {
            $students = $studentScraping->scrapingByProgram((int) $programId);
            Storage::put("students-{$programId}.json", json_encode($students));
            $this->createOrUpdateStudents($students);

            $this->info("Discentes do programa {$programId} importados/atualizados com sucesso.");

            return 0;
        } catch (\Exception $e) {
            $this->error($e->getMessage());

            return 1;
        }
    }

    private function createOrUpdateStudents(array $students): void
    {
        $service = app(\App\Services\UserService::class);

        foreach ($students as $student) {
            try {
                $user = DB::transaction(function () use ($student, $service) {
                    $user = $service->createOrUpdateStudent($student);
                    $allTeachers = $this->getAdvisorIds($student['teachers']);

                    $advisors = Arr::where($allTeachers, function ($i) {
                        return $i['relation_type'] === UserRelationType::ADVISOR->value;
                    });
                    $user->advisors()->sync($advisors);

                    $advisor = $user->advisors()->first();
                    if ($advisor) {
                        $user->area_id = $advisor->area_id;
                        $user->save();
                    }

                    $coAdvisors = Arr::where($allTeachers, function ($i) {
                        return $i['relation_type'] === UserRelationType::CO_ADVISOR->value;
                    });
                    $user->coadvisors()->sync($coAdvisors);

                    return $user;
                });

                $this->info("Discente {$user->name} cadastrado/atualizado com sucesso");
            } catch (IsProtectedException $exception) {
                $msg = "Erro ao cadastrar/atualizar discente {$student['name']}: {$exception->getMessage()}";
                $this->error($msg);
                Log::error($msg, $student);
            } catch (ValidationException $exception) {
                $msg = "Erro ao cadastrar/atualizar discente {$student['name']}: {$exception->getMessage()}";
                $this->error($msg);
                Log::error($msg, $student);
            }
        }
    }

    private function getAdvisorIds(array $teachers): array
    {
        $service = app(\App\Services\UserService::class);
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
                $teacherModel = $service->createOrUpdateTeacherByScraping($teacher);
            }

            $advisorIds[$teacherModel->id] = ['relation_type' => $teacher['relation_type']];
        }

        return $advisorIds;
    }
}
