<?php

namespace Tests\Feature\Admin;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLattesUploadsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_paginate_and_search_all_lattes_uploads(): void
    {
        $admin = User::factory()->admin()->create([
            'type' => UserType::MANAGER,
            'is_approved' => true,
        ]);

        foreach (range(1, 18) as $number) {
            User::factory()->create([
                'name' => "Docente {$number}",
                'type' => UserType::PROFESSOR,
                'is_approved' => true,
                'lattes_xml_path' => "lattes-files/{$number}.xml",
                'lattes_xml_uploaded_at' => now()->subMinutes($number),
            ]);
        }

        $this->actingAs($admin)
            ->getJson('/api/admin/lattes-uploads?per_page=15')
            ->assertOk()
            ->assertJsonPath('meta.total', 18)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonCount(15, 'data');

        $this->assertSame(
            3,
            count($this->getJson('/api/admin/lattes-uploads?per_page=15&page=2')->json('data')),
        );

        $this->getJson('/api/admin/lattes-uploads?search=Docente%2018')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.name', 'Docente 18');

        $this->getJson('/api/admin/lattes-uploads?per_page=101')
            ->assertUnprocessable();
    }
}
