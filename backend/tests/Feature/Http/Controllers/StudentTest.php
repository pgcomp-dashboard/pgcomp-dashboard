<?php

namespace Tests\Feature\Http\Controllers;

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

    public function test_fields_filter_master_response()
    {
        $getResponse = $this->get('/api/dashboard/fields/master');
        $postResponse = $this->post('/api/dashboard/fields/master');
        $patchResponse = $this->patch('/api/dashboard/fields/master');
        $deleteResponse = $this->delete('/api/dashboard/fields/master');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_fields_filter_doctorate_response()
    {
        $getResponse = $this->get('/api/dashboard/fields/doctorate');
        $postResponse = $this->post('/api/dashboard/fields/doctorate');
        $patchResponse = $this->patch('/api/dashboard/fields/doctorate');
        $deleteResponse = $this->delete('/api/dashboard/fields/doctorate');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_fields_filter_active_response()
    {
        $getResponse = $this->get('/api/dashboard/fields/active');
        $postResponse = $this->post('/api/dashboard/fields/active');
        $patchResponse = $this->patch('/api/dashboard/fields/active');
        $deleteResponse = $this->delete('/api/dashboard/fields/active');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_fields_filter_disabled_response()
    {
        $getResponse = $this->get('/api/dashboard/fields/disabled');
        $postResponse = $this->post('/api/dashboard/fields/disabled');
        $patchResponse = $this->patch('/api/dashboard/fields/disabled');
        $deleteResponse = $this->delete('/api/dashboard/fields/disabled');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_fields_filter_completed_response()
    {
        $getResponse = $this->get('/api/dashboard/fields/completed');
        $postResponse = $this->post('/api/dashboard/fields/completed');
        $patchResponse = $this->patch('/api/dashboard/fields/completed');
        $deleteResponse = $this->delete('/api/dashboard/fields/completed');

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


    public function test_subfields_filter_master_response()
    {
        $getResponse = $this->get('/api/dashboard/subfields/master');
        $postResponse = $this->post('/api/dashboard/subfields/master');
        $patchResponse = $this->patch('/api/dashboard/subfields/master');
        $deleteResponse = $this->delete('/api/dashboard/subfields/master');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_subfields_filter_doctorate_response()
    {
        $getResponse = $this->get('/api/dashboard/subfields/doctorate');
        $postResponse = $this->post('/api/dashboard/subfields/doctorate');
        $patchResponse = $this->patch('/api/dashboard/subfields/doctorate');
        $deleteResponse = $this->delete('/api/dashboard/subfields/doctorate');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_subfields_filter_active_response()
    {
        $getResponse = $this->get('/api/dashboard/subfields/active');
        $postResponse = $this->post('/api/dashboard/subfields/active');
        $patchResponse = $this->patch('/api/dashboard/subfields/active');
        $deleteResponse = $this->delete('/api/dashboard/subfields/active');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_subfields_filter_disabled_response()
    {
        $getResponse = $this->get('/api/dashboard/subfields/disabled');
        $postResponse = $this->post('/api/dashboard/subfields/disabled');
        $patchResponse = $this->patch('/api/dashboard/subfields/disabled');
        $deleteResponse = $this->delete('/api/dashboard/subfields/disabled');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

    public function test_subfields_filter_completed_response()
    {
        $getResponse = $this->get('/api/dashboard/subfields/completed');
        $postResponse = $this->post('/api/dashboard/subfields/completed');
        $patchResponse = $this->patch('/api/dashboard/subfields/completed');
        $deleteResponse = $this->delete('/api/dashboard/subfields/completed');

        $getResponse->assertStatus(200);
        $postResponse->assertStatus(405);
        $patchResponse->assertStatus(405);
        $deleteResponse->assertStatus(405);
    }

}
