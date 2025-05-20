<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ProfessorsListTest extends TestCase
{
    use DatabaseTransactions;

    public function test_total_students_per_advisor_without_filter()
    {
        $response = $this->getJson('/api/dashboard/total_students_per_advisor');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'name', 'advisedes_count'],
                 ]);

        $this->assertIsArray($response->json());
    }

    public function test_total_students_per_advisor_with_mestrando_filter()
    {
        $response = $this->getJson('/api/dashboard/total_students_per_advisor?user_type=mestrando');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'name', 'advisedes_count'],
                 ]);

        $this->assertIsArray($response->json());
    }

    public function test_total_students_per_advisor_with_doutorando_filter()
    {
        $response = $this->getJson('/api/dashboard/total_students_per_advisor?user_type=doutorando');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'name', 'advisedes_count'],
                 ]);

        $this->assertIsArray($response->json());
    }

    public function test_total_students_per_advisor_with_completed_filter()
    {
        $response = $this->getJson('/api/dashboard/total_students_per_advisor?user_type=completed');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'name', 'advisedes_count'],
                 ]);

        $this->assertIsArray($response->json());
    }
}
