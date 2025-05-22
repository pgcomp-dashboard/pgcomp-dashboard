<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class DefensesPerYearTest extends TestCase
{
    use DatabaseTransactions;

    public function test_defenses_per_year_without_filter()
    {
        $response = $this->getJson('/api/dashboard/defenses_per_year');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data, 'Esperava um array associativo ano→quantidade');
        $this->assertNotEmpty($data, 'Esperava pelo menos um ano no resultado');

        foreach ($data as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year, "Chave inesperada: {$year}");
            $this->assertIsInt($count, "Valor para o ano {$year} não é inteiro");
        }
    }

    public function test_defenses_per_year_with_mestrado_filter()
    {
        $response = $this->getJson('/api/dashboard/defenses_per_year?filter=mestrado');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year);
            $this->assertIsInt($count);
        }
    }

    public function test_defenses_per_year_with_doutorado_filter()
    {
        $response = $this->getJson('/api/dashboard/defenses_per_year?filter=doutorado');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year);
            $this->assertIsInt($count);
        }
    }
}
