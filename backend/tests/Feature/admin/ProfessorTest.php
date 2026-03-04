<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Enums\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

class ProfessorTest extends TestCase
{

    protected function setUp(): void
    {
        parent::setUp();
        // Seed necessary data if needed, or use factories
    }

    public function test_admin_can_list_professors()
    {
        $admin = User::factory()->admin()->create(['is_approved' => true]);
        User::factory()->count(3)->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/professors');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_show_professor()
    {
        $admin = User::factory()->admin()->create(['is_approved' => true]);
        $professor = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true
        ]);

        $response = $this->actingAs($admin)->getJson("/api/admin/professors/{$professor->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $professor->id);
    }

    public function test_admin_can_create_professor()
    {
        $admin = User::factory()->admin()->create(['is_approved' => true]);
        $data = [
            'name' => 'New Professor',
            'email' => 'prof@example.com',
            'password' => 'password',
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
            'is_senior' => true,
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/professors', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'prof@example.com',
            'type' => UserType::PROFESSOR->value,
            'is_senior' => true
        ]);
    }

    public function test_admin_can_update_professor()
    {
        $admin = User::factory()->admin()->create(['is_approved' => true]);
        $professor = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'name' => 'Old Name',
            'is_approved' => true
        ]);

        $response = $this->actingAs($admin)->putJson("/api/admin/professors/{$professor->id}", [
            'name' => 'Updated Name',
            'email' => $professor->email,
            'type' => UserType::PROFESSOR,
            'is_senior' => true,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $professor->id,
            'name' => 'Updated Name',
            'is_senior' => true
        ]);
    }

    public function test_non_admin_cannot_access_professor_endpoints()
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->getJson('/api/admin/professors')->assertStatus(403);
    }
}
