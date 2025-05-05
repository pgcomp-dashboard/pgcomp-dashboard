<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class ProductionsControllerTest extends TestCase
{

    public function test_lista_todas_as_producoes_por_ano()
    {
        $response = $this->getJson('/api/dashboard/all_production');

        $response->assertStatus(200)->assertJson(fn(AssertableJson $json) =>
        $json->hasAll(['years', 'data'])
        );
    }

    public function test_lista_producoes_de_mestrado_e_doutorado_por_ano()
    {
        $response = $this->getJson('/api/dashboard/students_production');
        $response->assertStatus(200)->assertJsonStructure([
            'year',
            'data' =>[
                0=>[
                    'label',
                    'data'
                ]
            ]
        ]);
    }



}
