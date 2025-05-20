<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ProductionPerQualisTest extends TestCase
{
    use DatabaseTransactions;

    public function test_production_per_qualis_without_filter()
    {
        $response = $this->getJson('/api/dashboard/production_per_qualis');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'years',
                     'data' => [
                         ['label', 'data'],
                     ],
                 ]);

        $payload = $response->json();
        $this->assertIsArray($payload['years'], 'Esperava um array de anos');
        $this->assertIsArray($payload['data'], 'Esperava um array de datasets');
        $this->assertNotEmpty($payload['years'], 'Array de anos não pode estar vazio');
        $this->assertNotEmpty($payload['data'], 'Array de data não pode estar vazio');
    }

    public function test_production_per_qualis_with_mestrando_filter()
    {
        $response = $this->getJson('/api/dashboard/production_per_qualis?user_type=mestrando');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'years',
                     'data' => [
                         ['label', 'data'],
                     ],
                 ]);

        $payload = $response->json();
        $this->assertIsArray($payload['years']);
        $this->assertIsArray($payload['data']);
    }

    public function test_production_per_qualis_with_doutorando_filter()
    {
        $response = $this->getJson('/api/dashboard/production_per_qualis?user_type=doutorando');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'years',
                     'data' => [
                         ['label', 'data'],
                     ],
                 ]);

        $payload = $response->json();
        $this->assertIsArray($payload['years']);
        $this->assertIsArray($payload['data']);
    }
}
