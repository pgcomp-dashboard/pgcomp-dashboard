<?php

namespace Tests\Feature\Dashboard;

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
        $this->assertIsArray($data, 'Esperava um array de objetos');
        $this->assertNotEmpty($data, 'Esperava ao menos um registro');

        foreach ($data as $item) {
            $this->assertIsArray($item, 'Cada elemento deve ser um array associativo');
            $this->assertArrayHasKey('year',      $item);
            $this->assertArrayHasKey('mestrado',  $item);
            $this->assertArrayHasKey('doutorado', $item);

            $this->assertMatchesRegularExpression(
                '/^\d{4}$/',
                (string) $item['year'],
                "Ano inválido em: {$item['year']}"
            );

            $this->assertIsInt($item['mestrado'],  "Valor de mestrado para {$item['year']} não é inteiro");
            $this->assertIsInt($item['doutorado'], "Valor de doutorado para {$item['year']} não é inteiro");
        }
    }

    public function test_defenses_per_year_with_mestrado_filter()
    {
        $response = $this->getJson('/api/dashboard/defenses_per_year?filter=mestrado');
        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $item) {
            $this->assertArrayHasKey('year',     $item);
            $this->assertArrayHasKey('mestrado', $item);

            $this->assertMatchesRegularExpression(
                '/^\d{4}$/',
                (string) $item['year']
            );
            $this->assertIsInt($item['mestrado']);
        }
    }

    public function test_defenses_per_year_with_doutorado_filter()
    {
        $response = $this->getJson('/api/dashboard/defenses_per_year?filter=doutorado');
        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $item) {
            $this->assertArrayHasKey('year',     $item);
            $this->assertArrayHasKey('doutorado', $item);

            $this->assertMatchesRegularExpression(
                '/^\d{4}$/',
                (string) $item['year']
            );
            $this->assertIsInt($item['doutorado']);
        }
    }
}
