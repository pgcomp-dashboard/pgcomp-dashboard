<?php

namespace App\Console\Commands;

use App\Domain\Sigaa\StudentScraping;
use App\Domain\Sigaa\TeacherScraping;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

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
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        $studentScraping = new StudentScraping();
        try {
            $students = $studentScraping->scrapingByCourse((int)$courseId);
            Storage::put("students-{$courseId}.json", json_encode($students));
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        return 0;
    }
}
