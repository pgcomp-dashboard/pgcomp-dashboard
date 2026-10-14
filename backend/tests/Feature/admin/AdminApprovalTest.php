<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Enums\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationMail;
use App\Mail\UserMail;
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

test('admin can approve multiple pending requests with one request', function () {
    Mail::fake();

    $admin = User::factory()->admin()->create(['is_approved' => true]);
    $professor = User::factory()->create([
        'type' => UserType::PROFESSOR,
        'is_approved' => false,
    ]);
    $student = User::factory()->create([
        'type' => UserType::STUDENT,
        'is_approved' => false,
        'registration_requested_at' => now(),
    ]);
    $adminRequest = User::factory()->create([
        'type' => UserType::PROFESSOR,
        'admin_status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->postJson('/api/admin/approval-requests/approve-many', [
            'requests' => [
                ['id' => $professor->id, 'request_type' => 'registration'],
                ['id' => $student->id, 'request_type' => 'registration'],
                ['id' => $adminRequest->id, 'request_type' => 'admin'],
            ],
        ])
        ->assertOk()
        ->assertJsonPath('data.approved', 3);

    $this->assertDatabaseHas('users', [
        'id' => $professor->id,
        'is_approved' => true,
    ]);
    $this->assertDatabaseHas('users', [
        'id' => $student->id,
        'is_approved' => true,
        'registration_requested_at' => null,
    ]);
    $this->assertDatabaseHas('users', [
        'id' => $adminRequest->id,
        'is_admin' => true,
        'admin_status' => 'approved',
    ]);

    Mail::assertSent(RegistrationMail::class, 2);
    Mail::assertSent(UserMail::class, 1);
});

test('bulk approval does not approve any request if one is no longer pending', function () {
    $admin = User::factory()->admin()->create(['is_approved' => true]);
    $professor = User::factory()->create([
        'type' => UserType::PROFESSOR,
        'is_approved' => false,
    ]);

    $this->actingAs($admin)
        ->postJson('/api/admin/approval-requests/approve-many', [
            'requests' => [
                ['id' => $professor->id, 'request_type' => 'registration'],
                ['id' => 999999, 'request_type' => 'admin'],
            ],
        ])
        ->assertUnprocessable();

    $this->assertDatabaseHas('users', [
        'id' => $professor->id,
        'is_approved' => false,
    ]);
});
