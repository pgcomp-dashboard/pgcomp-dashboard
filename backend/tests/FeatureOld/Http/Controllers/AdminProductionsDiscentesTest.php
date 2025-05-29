<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductionsDiscentesTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_view_discentes_productions()
    {

        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'student'])
        );

        $randomUser = User::whereType('student')->get()->random();

        $count = $randomUser->writerOf()->count();

        $response = $this->get("/api/portal/admin/students/{$randomUser->id}/productions/");

        $response->assertStatus(200);
        $response->assertJsonFragment(['total' => $count]);
    }

    public function test_view_unique_discentes_productions()
    {

        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'student'])
        );

        $randomUser = User::whereType('student')->get()->random();

        $production = $randomUser->writerOf()->get();

        if (count($production) == 0) {
            $response = $this->get("/api/portal/admin/students/{$randomUser->id}/productions/");

            $response->assertStatus(200);
        } else {
            $production = $production->random();

            $response = $this->get("/api/portal/admin/students/{$randomUser->id}/productions/{$production->id}");

            $response->assertStatus(200);
        }
    }

    public function test_create_discente_production()
    {

        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'student'])
        );

        $randomUser = User::whereType('student')->get()->random();

        $newProduction = [
            'title' => 'TesteProduction',
            'year' => 2010,
            'publisher_type' => 'App\\Models\\Journal',
            'publisher_id' => 946,
            'users_id' => 121,
        ];

        $response = $this->post("/api/portal/admin/students/{$randomUser->id}/productions/", $newProduction);

        $response->assertStatus(201);

    }

    public function test_edit_discente_production()
    {

        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'student'])
        );

        $randomUser = User::whereType('student')->get()->random();

        $newData = [
            'title' => 'novoTitulo',
            'year' => 2010,
        ];

        $production = $randomUser->writerOf()->get();
        if (count($production) == 0) {
            $response = $this->put("/api/portal/admin/students/{$randomUser->id}/productions/");

            $response->assertStatus(405);
        } else {
            $production = $production->random();

            $response = $this->put("/api/portal/admin/students/{$randomUser->id}/productions/{$production->id}", $newData);

            $response->assertStatus(200);
        }
    }

    public function test_delete_discente_production()
    {
        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'student'])
        );

        $randomUser = User::whereType('student')->get()->random();

        $response = $this->delete("/api/portal/admin/students/{$randomUser->id}/productions/");

        $response->assertStatus(405);
    }
}
