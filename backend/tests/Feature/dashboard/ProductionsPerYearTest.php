<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ProductionsTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * @dataProvider userTypesProvider
     */
    public function test_all_production_returns_map_for_each_user_type(string $userType)
    {
        $response = $this->getJson('/api/dashboard/all_production?user_type=' . $userType);
        $response->assertStatus(200);

        $payload = $response->json();
        $this->assertIsArray($payload, 'Esperava um mapa de ano→quantidade');
        $this->assertNotEmpty($payload, 'Esperava pelo menos um ano no resultado');

        foreach ($payload as $year => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $year, "Chave inesperada: {$year}");
            $this->assertIsInt($count, "Valor para o ano {$year} não é inteiro");
        }
    }

    public static function userTypesProvider(): array
    {
        return [
            ['docente'],
            ['mestrando'],
            ['doutorando'],
        ];
    }
}
