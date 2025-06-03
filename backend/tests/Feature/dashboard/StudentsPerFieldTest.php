<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class StudentsPerFieldTest extends TestCase
{
    use DatabaseTransactions;

    public function test_students_per_field_without_filter()
    {
        $response = $this->getJson('/api/dashboard/fields');
        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data, 'Esperava um array associativo campo→quantidade');
        $this->assertNotEmpty($data, 'Esperava pelo menos um campo no resultado');

        foreach ($data as $field => $count) {
            $this->assertIsString($field, "Chave inesperada: {$field}");
            $this->assertIsInt($count, "Valor para campo {$field} não é inteiro");
        }
    }

    public function test_students_per_field_with_mestrando_filter()
    {
        $response = $this->getJson('/api/dashboard/fields?selectedFilter=mestrando');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $field => $count) {
            $this->assertIsString($field);
            $this->assertIsInt($count);
        }
    }

    public function test_students_per_field_with_doutorando_filter()
    {
        $response = $this->getJson('/api/dashboard/fields?selectedFilter=doutorando');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $field => $count) {
            $this->assertIsString($field);
            $this->assertIsInt($count);
        }
    }

    public function test_students_per_field_with_completed_filter()
    {
        $response = $this->getJson('/api/dashboard/fields?selectedFilter=completed');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        foreach ($data as $field => $count) {
            $this->assertIsString($field);
            $this->assertIsInt($count);
        }
    }
}
