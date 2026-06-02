<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Publishers;
use App\Enums\PublisherType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

class PublisherTest extends TestCase
{

    public function test_admin_can_list_publishers()
    {
        $admin = User::factory()->admin()->create();
        Publishers::factory()->count(3)->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/publishers');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_show_publisher()
    {
        $admin = User::factory()->admin()->create();
        $publisher = Publishers::factory()->create();

        $response = $this->actingAs($admin)->getJson("/api/admin/publishers/{$publisher->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $publisher->id);
    }

    public function test_admin_can_create_publisher()
    {
        $admin = User::factory()->admin()->create();
        $data = [
            'name' => 'New Publisher',
            'publisher_type' => 'conference',
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/publishers', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('publishers', ['name' => 'New Publisher']);
    }

    public function test_admin_can_update_publisher()
    {
        $admin = User::factory()->admin()->create();
        $publisher = Publishers::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($admin)->putJson("/api/admin/publishers/{$publisher->id}", [
            'name' => 'Updated Name',
            'publisher_type' => $publisher->publisher_type,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('publishers', ['id' => $publisher->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_publisher()
    {
        $admin = User::factory()->admin()->create();
        $publisher = Publishers::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/admin/publishers/{$publisher->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('publishers', ['id' => $publisher->id]);
    }
}
