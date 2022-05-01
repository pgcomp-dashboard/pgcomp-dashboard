<?php

namespace Tests\Feature\Http\Controllers\Http\Controllers;

use Tests\TestCase;

class QualisTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_qualis_response()
    {
        $getResponse = $this->get('/api/dashboard/production_per_qualis');
        $postResponse = $this->post('/api/dashboard/production_per_qualis');
        $patchResponse = $this->patch('/api/dashboard/production_per_qualis');
        $deleteResponse = $this->delete('/api/dashboard/production_per_qualis');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
