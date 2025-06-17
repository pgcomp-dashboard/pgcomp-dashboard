<?php

namespace App\Services;

use App\Models\ScrapingExecution;

class ScrapingExecutionService
{
    public function register(string $command): ScrapingExecution
    {
        return ScrapingExecution::create([
            'command' => $command,
        ]);
    }
}
