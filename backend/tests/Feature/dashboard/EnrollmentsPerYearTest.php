<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class EnrollmentsPerYearTest extends TestCase
{
    use DatabaseTransactions;

    public function test_enrollments_per_year_without_filter()
    {
        $response = $this->getJson('/api/dashboard/enrollments_per_year');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['year', 'mestrado', 'doutorado'],
            ]);

        $payload = $response->json();
        $this->assertIsArray($payload, 'Esperava um array de objetos com keys year, mestrado e doutorado');
        $this->assertNotEmpty($payload, 'Esperava pelo menos um item no resultado');

        foreach ($payload as $item) {
            $this->assertArrayHasKey('year', $item);
            $this->assertArrayHasKey('mestrado', $item);
            $this->assertArrayHasKey('doutorado', $item);

            $this->assertIsInt($item['year'], "Valor de 'year' não é inteiro");
            $this->assertIsInt($item['mestrado'], "Valor de 'mestrado' não é inteiro");
            $this->assertIsInt($item['doutorado'], "Valor de 'doutorado' não é inteiro");
        }
    }

    public function test_enrollments_per_year_with_mestrado_filter()
    {
        $response = $this->getJson('/api/dashboard/enrollments_per_year?filter=mestrado');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['year', 'mestrado', 'doutorado'],
            ]);

        $payload = $response->json();
        $this->assertIsArray($payload);
        $this->assertNotEmpty($payload);

        foreach ($payload as $item) {
            $this->assertArrayHasKey('year', $item);
            $this->assertArrayHasKey('mestrado', $item);
            $this->assertArrayHasKey('doutorado', $item);

            $this->assertIsInt($item['year']);
            $this->assertIsInt($item['mestrado']);
            $this->assertIsInt($item['doutorado']);
        }
    }

    public function test_enrollments_per_year_with_doutorado_filter()
    {
        $response = $this->getJson('/api/dashboard/enrollments_per_year?filter=doutorado');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['year', 'mestrado', 'doutorado'],
            ]);

        $payload = $response->json();
        $this->assertIsArray($payload);
        $this->assertNotEmpty($payload);

        foreach ($payload as $item) {
            $this->assertArrayHasKey('year', $item);
            $this->assertArrayHasKey('mestrado', $item);
            $this->assertArrayHasKey('doutorado', $item);

            $this->assertIsInt($item['year']);
            $this->assertIsInt($item['mestrado']);
            $this->assertIsInt($item['doutorado']);
        }
    }
}
