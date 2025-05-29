<?php

namespace Tests\Feature\Http\Controllers;

use Tests\TestCase;

class ProductionsTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_productions_response()
    {
        $getResponse = $this->get('/api/dashboard/all_production');
        $postResponse = $this->post('/api/dashboard/all_production');
        $patchResponse = $this->patch('/api/dashboard/all_production');
        $deleteResponse = $this->delete('/api/dashboard/all_production');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_productions_filter_docente_response()
    {
        $getResponse = $this->get('/api/dashboard/all_production?user_type=docente');
        $postResponse = $this->post('/api/dashboard/all_production?user_type=docente');
        $patchResponse = $this->patch('/api/dashboard/all_production?user_type=docente');
        $deleteResponse = $this->delete('/api/dashboard/all_production?user_type=docente');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_productions_filter_mestrando_response()
    {
        $getResponse = $this->get('/api/dashboard/all_production?user_type=mestrando');
        $postResponse = $this->post('/api/dashboard/all_production?user_type=mestrando');
        $patchResponse = $this->patch('/api/dashboard/all_production?user_type=mestrando');
        $deleteResponse = $this->delete('/api/dashboard/all_production?user_type=mestrando');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_productions_filter_doutorando_response()
    {
        $getResponse = $this->get('/api/dashboard/all_production?user_type=doutorando');
        $postResponse = $this->post('/api/dashboard/all_production?user_type=doutorando');
        $patchResponse = $this->patch('/api/dashboard/all_production?user_type=doutorando');
        $deleteResponse = $this->delete('/api/dashboard/all_production?user_type=doutorando');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_productions_filter_jornal_response()
    {
        $getResponse = $this->get('/api/dashboard/all_production?publisher_type=jornal');
        $postResponse = $this->post('/api/dashboard/all_production?publisher_type=jornal');
        $patchResponse = $this->patch('/api/dashboard/all_production?publisher_type=jornal');
        $deleteResponse = $this->delete('/api/dashboard/all_production?publisher_type=jornal');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_productions_filter_conference_response()
    {
        $getResponse = $this->get('/api/dashboard/all_production?publisher_type=conference');
        $postResponse = $this->post('/api/dashboard/all_production?publisher_type=conference');
        $patchResponse = $this->patch('/api/dashboard/all_production?publisher_type=conference');
        $deleteResponse = $this->delete('/api/dashboard/all_production?publisher_type=conference');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }
}
