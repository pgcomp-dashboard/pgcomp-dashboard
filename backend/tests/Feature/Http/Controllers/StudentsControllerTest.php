<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StudentsControllerTest extends TestCase
{
    public function test_sub_area_estudante()
    {
        $response = $this->getJson('/api/dashboard/subfields');
        $response->assertStatus(200)->assertJsonStructure([
            'subfields',
            'data'
        ]);
    }

    public function test_sub_area_estudante_mestrando()
    {
        $response = $this->getJson('/api/dashboard/subfields/master');
        $response->assertStatus(200)->assertJsonStructure([
            'subfields',
            'data'
        ]);
    }

    public function test_sub_area_estudante_doutorando()
    {
        $response = $this->getJson('/api/dashboard/subfields/doctorate');
        $response->assertStatus(200)->assertJsonStructure([
            'subfields',
            'data'
        ]);
    }

    public function test_sub_rea_estudante_ativo()
    {
        $response = $this->getJson('/api/dashboard/subfields/active');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }

    public function test_sub_area_estudante_inativo()
    {
        $response = $this->getJson('/api/dashboard/subfields/disabled');
        $response->assertStatus(200)->assertJsonStructure([
            'subfields',
            'data'
        ]);
    }

    public function test_sub_area_estudante_concluidos()
    {
        $response = $this->getJson('/api/dashboard/subfields/completed');
        $response->assertStatus(200)->assertJsonStructure([
            'subfields',
            'data'
        ]);
    }

    public function test_area_estudante()
    {
        $response = $this->getJson('/api/dashboard/fields');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }

    public function test_area_estudante_mestrandos()
    {
        $response = $this->getJson('/api/dashboard/fields/master');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }

    public function test_area_estudante_doutorandos()
    {
        $response = $this->getJson('/api/dashboard/fields/doctorate');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }

    public function test_area_estudante_ativo()
    {
        $response = $this->getJson('/api/dashboard/fields/active');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }

    public function test_area_estudante_inativo()
    {
        $response = $this->getJson('/api/dashboard/fields/disabled');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }

    public function test_area_estudante_concluidos()
    {
        $response = $this->getJson('/api/dashboard/fields/completed');
        $response->assertStatus(200)->assertJsonStructure([
            'fields',
            'data'
        ]);
    }



}
