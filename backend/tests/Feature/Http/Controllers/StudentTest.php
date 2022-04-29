<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StudentTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_fields_response()
    {
        $getResponse = $this->get('/api/dashboard/fields');
        $postResponse = $this->post('/api/dashboard/fields');
        $patchResponse = $this->patch('/api/dashboard/fields');
        $deleteResponse = $this->delete('/api/dashboard/fields');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_subfields_response()
    {
        $getResponse = $this->get('/api/dashboard/subfields');
        $postResponse = $this->post('/api/dashboard/subfields');
        $patchResponse = $this->patch('/api/dashboard/subfields');
        $deleteResponse = $this->delete('/api/dashboard/subfields');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
