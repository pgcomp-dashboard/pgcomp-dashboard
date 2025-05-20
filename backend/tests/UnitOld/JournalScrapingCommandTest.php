<?php

namespace Tests\Unit;

use App\Console\Commands\JournalScrapingCommand;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class JournalScrapingCommandTest extends TestCase
{
    public function test_stringToDate()
    {
        $scraping = new ReflectionClass(JournalScrapingCommand::class);
        $method = $scraping->getMethod('stringToDate');
        $journalScrapingCommand = new JournalScrapingCommand();

        $values = [
            ['arg' => '01/01/2022 23:25:59', 'return' => '2022-01-01 23:25:59'],
            ['arg' => '1/03/2022 23:25:59', 'return' => '2022-03-01 23:25:59'],
            ['arg' => '05/1/2022 23:25:59', 'return' => '2022-01-05 23:25:59'],
            ['arg' => '07/1/2022 3:25:59', 'return' => '2022-01-07 03:25:59'],
            ['arg' => '23:25:59', 'return' => null],
            ['arg' => '01/01/2022', 'return' => null],
            ['arg' => '2022-01-01 23:25:59', 'return' => null],
            ['arg' => '', 'return' => null],
            ['arg' => '123', 'return' => null],
        ];

        foreach ($values as $value) {
            $this->assertEquals(
                $method->invoke($journalScrapingCommand, $value['arg'])?->toDateTimeString(),
                $value['return']
            );
        }
    }
}
