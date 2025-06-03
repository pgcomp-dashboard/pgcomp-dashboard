<?php

namespace Tests\Feature;

use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class ProgramsControllerTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_lista_programsa_cadastrados()
    {
        // assertJsonStringEqualsJsonString()
        $response = $this->getJson('/api/dashboard/program');

        $response->assertStatus(200)->assertJson(fn (AssertableJson $json) => $json->hasAll(['sigla', 'nome'])
        );
    }
}
