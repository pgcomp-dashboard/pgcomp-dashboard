<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class GetQualisTest extends TestCase
{
    use DatabaseTransactions;

    protected function authenticateAdmin(): string
    {
        $password = 'adminpass';
        $user = User::factory()->create([
            'email' => 'admin+'.uniqid().'@example.com',
            'password' => Hash::make($password),
            'type' => 'guest',
            'is_admin' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token']);

        return $response->json('token');
    }

    public function test_get_all_qualis_returns_paginated_structure()
    {
        $token = $this->authenticateAdmin();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/portal/admin/qualis');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => ['id', 'code', 'score', 'created_at', 'updated_at'],
                ],
                'first_page_url', 'from', 'last_page', 'last_page_url',
                'links', 'next_page_url', 'path', 'per_page',
                'prev_page_url', 'to', 'total',
            ]);

        $data = $response->json('data');
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);
    }
}
