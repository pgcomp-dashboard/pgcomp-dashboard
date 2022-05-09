<?php

namespace Tests\Feature\Http\Controllers;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class Program extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_program_response()
    {
        $getResponse = $this->get('/api/dashboard/program');
        $postResponse = $this->post('/api/dashboard/program');
        $patchResponse = $this->patch('/api/dashboard/program');
        $deleteResponse = $this->delete('/api/dashboard/program');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
