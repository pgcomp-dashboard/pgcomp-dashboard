<?php

namespace Tests\Unit;

use App\Domain\Sigaa\StudentScraping;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class SigaaScrapingTest extends TestCase
{
    public function test_get_siape_id_from_url()
    {
        $scraping = new ReflectionClass(StudentScraping::class);
        $method = $scraping->getMethod('getSiapeIdFromUrl');
        $studentScraping = new StudentScraping();

        $values = [
            [
                'arg' => 'ola mundo',
                'return' => null,
            ],
            [
                'arg' => null,
                'return' => null,
            ],
            [
                'arg' => '',
                'return' => null,
            ],
            [
                'arg' => 'https://sigaa.ufba.br/sigaa/public/docente/portal.jsf?siape=287345',
                'return' => 287345,
            ],
            [
                'arg' => 'https://sigaa.ufba.br/sigaa/public/docente/portal.jsf?siape=',
                'return' => null,
            ],
            [
                'arg' => 'https://sigaa.ufba.br/sigaa/public/docente/portal.jsf?siape=12345&lang=',
                'return' => 12345,
            ],
            [
                'arg' => 'https://sigaa.ufba.br/sigaa/prodocente/lattes.gif;jsessionid=998C28CFB19.miguelcalmon',
                'return' => null,
            ],
            [
                'arg' => 'https://sigaa.ufba.br/sigaa/contato.png;jsessionid=998C6B9D07F6A0F074FB19.miguelcalmon',
                'return' => null,
            ],
            [
                'arg' => 'https://sigaa.ufba.br/sigaa/public/programa/equipe.jsf?lc=pt_BR&id=1820',
                'return' => null,
            ],
        ];

        foreach ($values as $value) {
            $this->assertEquals($method->invoke($studentScraping, $value['arg']), $value['return']);
        }
    }
}
