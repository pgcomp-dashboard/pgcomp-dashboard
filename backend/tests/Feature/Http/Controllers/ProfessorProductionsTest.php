<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Journal;
use App\Models\Production;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfessorProductionsTest extends TestCase
{

    use DatabaseTransactions;

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_get_professor_productions()
    {

        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $randomUser = User::whereType("professor")->get()->random();

        $count = $randomUser->writerOf()->count();

        $response = $this->get("/api/portal/admin/professors/{$randomUser->id}/productions/");

        $response->assertStatus(200);
        $response->assertJsonFragment(["total" => $count]);
    }

    public function test_post_professor_production()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $randomUser = User::whereType("professor")->get()->random();

        $newProduction = [
            "title" => "Teste",
            "year" => 2022,
            "publisher_type" => Journal::class,
            "publisher_id" => 946,
            "users_id" => $randomUser->id
        ];


        $response = $this->post("/api/portal/admin/professors/{$randomUser->id}/productions/", $newProduction);

        $response->assertStatus(201);
    }

    public function test_edit_professor_production()
    {

        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $author = Production::all()->random()->isWroteBy()->whereType("professor")->first();

        $production = $author->writerOf()->get()->random();

        $editData = ["title" => "Teste"];

        $response = $this->put("/api/portal/admin/professors/{$author->id}/productions/{$production->id}", $editData );

        $response->assertStatus(200)->assertJsonFragment($editData);
    }

    public function test_delete_professor_production()
    {
        Sanctum::actingAs(
            User::factory()->create(["is_admin" => true, "type" => "student"])
        );

        $randomUser = User::whereType("professor")->get()->random();

        $response = $this->delete("/api/portal/admin/professors/{$randomUser->id}/productions/");

        $response->assertStatus(405);
    }
}
