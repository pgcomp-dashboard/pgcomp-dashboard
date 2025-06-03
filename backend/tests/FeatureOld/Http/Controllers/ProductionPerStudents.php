<?php

namespace Tests\Feature\Http\Controllers;

use Tests\TestCase;

class ProductionPerStudents extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_production_per_students()
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
