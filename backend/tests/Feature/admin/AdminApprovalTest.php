<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

// Policy Test
test('admin can approve pending users', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->pending()->create();

    expect($admin->can('approve', $target))->toBeTrue();
});

test('admin cannot approve themselves', function () {
    $admin = User::factory()->admin()->create();

    expect($admin->can('approve', $admin))->toBeFalse();
});

test('a non-admin user cannot approve anyone', function () {
    $user = User::factory()->create();
    $target = User::factory()->pending()->create();

    expect($user->can('approve', $target))->toBeFalse();
});

// Integration test
test('it returns 403 if a regular user tries to approve', function () {
    $user = User::factory()->create();
    $target = User::factory()->pending()->create();

    $this->actingAs($user)
        ->postJson("/api/admin/admin-request/{$target->id}", ['status' => 'approved'])
        ->assertStatus(403);
});

test('it returns 400 if the user is not pending', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->create(['admin_status' => 'approved']); // Already approved

    $this->actingAs($admin)
        ->postJson("/api/admin/admin-request/{$target->id}", ['status' => 'approved'])
        ->assertStatus(400);
});
