<?php

namespace App\Console\Commands\Scraping;

use App\Domain\Sigaa\DefenseScraping;
use App\Domain\Sigaa\StudentScraping;
use App\Domain\Sigaa\TeacherScraping;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Exceptions\IsProtectedException;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SigaaScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:sigaa-scraping {programId=1820 : ID do curso no site SIGAA}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'SIGAA Web Scraping';

    /**
     * Execute the console command.
     *
     * @throws Exception
     */
    public function handle(): int
    {
        // @see https://sigaa.ufba.br/sigaa/public/programa/lista.jsf
        $programId = $this->argument('programId');
        if (! is_numeric($programId) || $programId <= 0) {
            $this->error('Informe um ID de curso válido');

            return 1;
        }

        $teacherScraping = new TeacherScraping;
        try {
            $teachers = $teacherScraping->scrapingByProgram((int) $programId);
            Storage::put("teachers-{$programId}.json", json_encode($teachers));
            $this->createOrUpdateTeachers($teachers);

            $teachersWithArea = $teacherScraping->fillProfessorsWithArea();
            $this->info('Professores com área preenchida com sucesso');
            $this->table([
                'Nome',
                'ID Area',
                'Observação',
            ], $teachersWithArea);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        $studentScraping = new StudentScraping;
        try {
            $students = $studentScraping->scrapingByProgram((int) $programId);
            Storage::put("students-{$programId}.json", json_encode($students));
            $this->createOrUpdateStudents($students);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        $defenseScraping = new DefenseScraping;
        try {
            $data = $defenseScraping->scrapingByProgram((int) $programId);
            Storage::put("defenses-{$programId}.json", json_encode($data));
            $this->updateDefended($data);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        return 0;
    }

    private function createOrUpdateTeachers(array $teachers): void
    {
        foreach ($teachers as $teacher) {
            try {
                $user = User::createOrUpdateTeacherByScraping($teacher);
                $this->info("Docente {$user->name} cadastrado/atualizado com sucesso");
            } catch (IsProtectedException $exception) {
                $msg = "Erro ao cadastrar/atualizar docente {$teacher['name']}: {$exception->getMessage()}";
                $this->error($msg);
                Log::error($msg, $teacher);
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
                $user = DB::transaction(function () use ($student) {
                    $user = User::createOrUpdateStudentByScraping($student);
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
                $msg = "Erro ao cadastrar/atualizar docente {$student['name']}: {$exception->getMessage()}";
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
                $teacherModel = User::createOrUpdateTeacherByScraping($teacher);
            }
            $advisorIds[$teacherModel->id] = ['relation_type' => $teacher['relation_type']];
        }

        return $advisorIds;
    }

    private function updateDefended(array $data)
    {
        foreach ($data as $item) {
            $userNotDefended = User::where('type', UserType::STUDENT->value)
                ->where('name', $item['student'])
                ->whereNull('defended_at')
                ->first();
            if ($userNotDefended && ! empty($item['date'])) {
                $advisor = $userNotDefended->advisors()->first();

                if ($advisor) {
                    $userNotDefended->area_id = $advisor->area_id;
                }

                $userNotDefended->defended_at = date($item['date']);
                $userNotDefended->save();

                $this->info("{$userNotDefended->name} defendeu.");

                continue;
            }

            $user = User::where('type', UserType::STUDENT->value)
                ->where('name', $item['student'])
                ->first();

            if (! empty($user) && $user->is_protected) {
                $msg = "{$user->name} | Não é possivel atualizar um discente protegido.";
                $this->error($msg);
                Log::error($msg, $item);

                continue;
            }

            $teacher = User::where('type', UserType::PROFESSOR->value)
                ->where('name', $item['teacher'])
                ->first(['id']);

            $registration = User::whereNotNull('registration')
                ->orderBy('registration')
                ->first(['registration'])
                ->registration;

            $areaId = User::where('type', UserType::PROFESSOR->value)
                ->where('id', $teacher?->id)
                ->whereNotNull(['id', 'area_id'])
                ->first(['area_id'])?->area_id;

            $userCreated = User::createOrUpdateStudentByScraping([
                'id' => $user?->id ?? null,
                'registration' => $user?->registration ?? $registration - 1,
                'name' => $item['student'],
                'course_id' => $item['course_id'],
                'area_id' => $areaId,
                'defended_at' => $item['date'],
            ]);

            if ($teacher && $userCreated->advisors()->where('id', $teacher->id)->doesntExist()) {
                $userCreated->advisors()->attach([$teacher->id => ['relation_type' => 'advisor']]);
            }
        }
    }
}
