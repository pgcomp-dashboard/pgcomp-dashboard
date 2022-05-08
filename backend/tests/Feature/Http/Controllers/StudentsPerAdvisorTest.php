<?php

namespace Tests\Feature\Http\Controllers;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StudentsPerAdvisorTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_students_per_adivisor_response()
    {
        $getResponse = $this->get('/api/dashboard/students_production');
        $postResponse = $this->post('/api/dashboard/students_production');
        $patchResponse = $this->patch('/api/dashboard/students_production');
        $deleteResponse = $this->delete('/api/dashboard/students_production');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
