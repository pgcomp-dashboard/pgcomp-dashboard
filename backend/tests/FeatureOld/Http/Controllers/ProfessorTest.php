<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfessorTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_view_all_professors()
    {
        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'student'])
        );

        $total = User::whereType('professor')->get()->count();

        $response = $this->get('/api/portal/admin/professors');

        $response->assertStatus(200)->assertJsonFragment(['total' => $total]);
    }

    public function test_view_unique_professor()
    {
        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'professor'])
        );

        $randomUser = User::whereType('professor')->get()->random();

        $response = $this->get("/api/portal/admin/professors/{$randomUser->id}");

        $response->assertStatus(200)->assertJson($randomUser->toArray());
    }

    public function test_create_professor()
    {
        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'professor'])
        );

        $newUser = [
            'password' => 'password',
            'password_confirmation' => 'password',
            'siape' => '7777777',
            'program_id' => '1',
            'type' => 'professor',
            'name' => 'teste',
            'email' => 'teste@teste.com',
        ];

        $response = $this->post('/api/portal/admin/professors/', $newUser);

        $response->assertStatus(201);
    }

    public function test_edit_professor_data()
    {
        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'professor'])
        );

        $randomUser = User::whereType('professor')->get()->random();

        $editData = ['name' => 'Teste'];

        $response = $this->put("/api/portal/admin/professors/{$randomUser->id}", $editData);

        $response->assertStatus(200)->assertJson($editData);
    }

    public function test_delete_professor()
    {
        Sanctum::actingAs(
            User::factory()->create(['is_admin' => true, 'type' => 'professor'])
        );

        $randomUser = User::whereType('professor')->get()->random();

        $response = $this->delete("/api/portal/admin/professors/{$randomUser->id}");

        $response->assertStatus(405);
    }
}
