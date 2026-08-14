<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Redis;
use InvalidArgumentException;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\MergePendingPublishers::class,
    ];
    /**
     * Define the application's command schedule.
     *
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        // $day = Redis::get('scraping:run');
        // $schedule->command('telescope:prune --hours=48')->daily();
        // $schedule->command('scraping:run')->cron("0 0 */$day * *");
        $schedule->command('mail:send-accreditation-warning')->yearlyOn(7, 1, '08:00');
        $schedule->command('mail:send-lattes-reminder')->cron('0 8 1 4,10 *');

    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }

}
