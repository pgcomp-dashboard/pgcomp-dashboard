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
    protected $signature = 'sigaa:scraping';

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
        $teacherScraping = new TeacherScraping();
        try {
            $teachers = $teacherScraping->scrapingByCourse(1820); // 1820 PGCOMP
            Storage::put('teachers.json', json_encode($teachers));
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        $studentScraping = new StudentScraping();
        try {
            $students = $studentScraping->scrapingByCourse(1820); // 1820 PGCOMP
            Storage::put('students.json', json_encode($students));
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        return 0;
    }
}
