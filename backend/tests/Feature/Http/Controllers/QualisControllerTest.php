<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class QualisControllerTest extends TestCase
{

    public function test_lista_producoes_por_ano_e_qualis()
    {
        $response = $this->getJson('/api/dashboard/production_per_qualis');
        $response->assertStatus(200)->assertJsonStructure([
            'years',
            'data'=>[
                0=>[
                    'label',
                    'data'
                ]
            ]
        ]);
    }

    public function test_lista_producoes_por_ano_e_qualis_apenas_mestrandos()
    {
        $response = $this->getJson('/api/dashboard/production_per_qualis?user_type=mestrando');
        $response->assertStatus(200)->assertJsonStructure([
            'years',
            'data'=>[
                0=>[
                    'label',
                    'data'
                ]
            ]
        ]);
    }

    public function test_lista_producoes_por_ano_e_qualis_apenas_doutorandos()
    {
        $response = $this->getJson('/api/dashboard/production_per_qualis?user_type=doutorando');
        $response->assertStatus(200)->assertJsonStructure([
            'years',
            'data'=>[
                0=>[
                    'label',
                    'data'
                ]
            ]
        ]);
    }
}
