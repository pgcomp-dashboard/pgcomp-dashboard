<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class InitializeCronJobDefaultRedis extends Command
{
    protected $signature = 'app:initialize-cron-job-default-redis';

    protected $description = 'Checks if `scraping:cron` exists in Redis and creates it if missing. This command is scheduled to run every Monday.';

    public function handle()
    {
        $key = 'scraping:cron';

        if (!Redis::exists($key)) {
            Redis::set($key, 7);
            $this->info("Key '{$key}' created with 7 days");
        } else {
            $this->info("Key '{$key}' already exists");
        }
    }
}
