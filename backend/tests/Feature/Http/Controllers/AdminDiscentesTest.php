<?php

namespace Tests\Feature\Http\Controllers;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;

class AdminDiscentesTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_view_all_discentes()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $total = User::whereType("student")->get()->count();

        $response = $this->get('/api/portal/admin/students');

        $response->assertStatus(200)->assertJsonFragment(["total" => $total]);
    }

    public function test_view_unique_discentes()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $randomUser = User::whereType("student")->get()->random();

        $response = $this->get("/api/portal/admin/students/{$randomUser->id}");

        $response->assertStatus(200)->assertJson($randomUser->toArray());
    }
    public function test_create_discente()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $newUser = [
            "password" => "password",
            "password_confirmation" => "password",
            "siape" => "7777777",
            "course_id" => 1,
            "registration" => 000000000,
            "program_id" => "1",
            "type" => "student",
            "name" => "testeDiscente",
            "email" => "testeDiscente@teste.com"
        ];

        $response = $this->post("/api/portal/admin/students/", $newUser);

        $response->assertStatus(201);
    }
    public function test_edit_discente_data()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $randomUser = User::whereType("student")->get()->random();

        $editData = ["name" => "TesteNewName"];

        $response = $this->put("/api/portal/admin/students/{$randomUser->id}", $editData);

        $response->assertStatus(200)->assertJson($editData);
    }
    public function test_delete_discente()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $randomUser = User::whereType("student")->get()->random();

        $response = $this->delete("/api/portal/admin/students/{$randomUser->id}");

        $response->assertStatus(405);
    }
}
