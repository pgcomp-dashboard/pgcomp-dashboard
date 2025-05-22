<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ProfessorsEndpointTest extends TestCase
{
    use DatabaseTransactions;

    public function test_professors_endpoint_returns_expected_structure()
    {
        $response = $this->getJson('/api/dashboard/professors');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         ['id', 'name'],
                     ],
                 ]);

        $payload = $response->json();
        $this->assertEquals('success', $payload['status']);

        $this->assertIsArray($payload['data'], 'Esperava um array em data');
        $this->assertNotEmpty($payload['data'], 'Esperava ao menos um professor');

        foreach ($payload['data'] as $professor) {
            $this->assertArrayHasKey('id', $professor);
            $this->assertArrayHasKey('name', $professor);
            $this->assertIsInt($professor['id'], 'O campo id deve ser inteiro');
            $this->assertIsString($professor['name'], 'O campo name deve ser string');
        }
    }
}
