<?php

namespace Tests\Feature;

use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    /**
     * @return void
     */
    public function test_lista_docentes_cadastrados_no_banco_de_dados()
    {
        // assertJsonStringEqualsJsonString()
        $response = $this->getJson('/api/dashboard/total_students_per_advisor');

        $response->assertStatus(200)->assertJson(fn (AssertableJson $json) => $json->first(fn ($json) => $json->hasAll(['id', 'name', 'advisedes_count']))
        );
    }
}
