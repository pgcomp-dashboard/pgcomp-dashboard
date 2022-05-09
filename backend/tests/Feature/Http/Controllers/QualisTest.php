<?php

namespace Tests\Feature\Http\Controllers;

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

    public function test_qualis_filter_docente_response() 
    {
        $getResponse = $this->get('/api/dashboard/production_per_qualis?user_type=docente');
        $postResponse = $this->post('/api/dashboard/production_per_qualis?user_type=docente');
        $patchResponse = $this->patch('/api/dashboard/production_per_qualis?user_type=docente');
        $deleteResponse = $this->delete('/api/dashboard/production_per_qualis?user_type=docente');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_qualis_filter_mestrando_response() 
    {
        $getResponse = $this->get('/api/dashboard/production_per_qualis?user_type=mestrando');
        $postResponse = $this->post('/api/dashboard/production_per_qualis?user_type=mestrando');
        $patchResponse = $this->patch('/api/dashboard/production_per_qualis?user_type=mestrando');
        $deleteResponse = $this->delete('/api/dashboard/production_per_qualis?user_type=mestrando');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
    public function test_qualis_filter_doutorando_response() 
    {
        $getResponse = $this->get('/api/dashboard/production_per_qualis?user_type=doutorando');
        $postResponse = $this->post('/api/dashboard/production_per_qualis?user_type=doutorando');
        $patchResponse = $this->patch('/api/dashboard/production_per_qualis?user_type=doutorando');
        $deleteResponse = $this->delete('/api/dashboard/production_per_qualis?user_type=doutorando');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
    public function test_qualis_filter_jornal_response() 
    {
        $getResponse = $this->get('/api/dashboard/production_per_qualis?publisher_type=jornal');
        $postResponse = $this->post('/api/dashboard/production_per_qualis?publisher_type=jornal');
        $patchResponse = $this->patch('/api/dashboard/production_per_qualis?publisher_type=jornal');
        $deleteResponse = $this->delete('/api/dashboard/production_per_qualis?publisher_type=jornal');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
    public function test_qualis_filter_conference_response() 
    {
        $getResponse = $this->get('/api/dashboard/production_per_qualis?publisher_type=conference');
        $postResponse = $this->post('/api/dashboard/production_per_qualis?publisher_type=conference');
        $patchResponse = $this->patch('/api/dashboard/production_per_qualis?publisher_type=conference');
        $deleteResponse = $this->delete('/api/dashboard/production_per_qualis?publisher_type=conference');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
