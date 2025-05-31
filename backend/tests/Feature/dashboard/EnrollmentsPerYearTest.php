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
                'enrollments',
            ]);

        $payload = $response->json('enrollments');
        $this->assertIsArray($payload, 'Esperava um array associativo ano→quantidade');
        $this->assertNotEmpty($payload, 'Esperava pelo menos um ano no resultado');

        foreach ($payload as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year, "Chave inesperada: {$year}");
            $this->assertIsInt($count, "Valor para o ano {$year} não é inteiro");
        }
    }

    public function test_enrollments_per_year_with_mestrado_filter()
    {
        $response = $this->getJson('/api/dashboard/enrollments_per_year?filter=mestrado');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'enrollments',
            ]);

        $payload = $response->json('enrollments');
        $this->assertIsArray($payload);
        $this->assertNotEmpty($payload);

        foreach ($payload as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year);
            $this->assertIsInt($count);
        }
    }

    public function test_enrollments_per_year_with_doutorado_filter()
    {
        $response = $this->getJson('/api/dashboard/enrollments_per_year?filter=doutorado');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'enrollments',
            ]);

        $payload = $response->json('enrollments');
        $this->assertIsArray($payload);
        $this->assertNotEmpty($payload);

        foreach ($payload as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year);
            $this->assertIsInt($count);
        }
    }
}
