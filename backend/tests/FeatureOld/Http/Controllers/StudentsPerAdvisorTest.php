<?php

namespace Tests\Feature\Http\Controllers;

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
        $getResponse = $this->get('/api/dashboard/total_students_per_advisor');
        $postResponse = $this->post('/api/dashboard/total_students_per_advisor');
        $patchResponse = $this->patch('/api/dashboard/total_students_per_advisor');
        $deleteResponse = $this->delete('/api/dashboard/total_students_per_advisor');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
