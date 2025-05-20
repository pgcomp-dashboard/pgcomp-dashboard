<?php

namespace Tests\Feature\Admin;

use Tests\TestCase;
use App\Models\User;
use App\Models\StratumQualis;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;

class UpdateStratumQualisTest extends TestCase
{
    use DatabaseTransactions;

    protected function authenticateAdmin(): string
    {
        $password = 'adminpass';
        $user = User::factory()->create([
            'email'    => 'admin+' . uniqid() . '@example.com',
            'password' => Hash::make($password),
            'type'     => 'guest',    
            'is_admin' => true,      
        ]);

        $resp = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => $password,
        ]);
        $resp->assertStatus(200)->assertJsonStructure(['token']);
        return $resp->json('token');
    }

    public function test_update_qualis_successful()
    {
        $qualis = StratumQualis::factory()->create([
            'code'  => 'A1',
            'score' => 100,
        ]);

        $token = $this->authenticateAdmin();

        $payload = ['code' => 'B2', 'score' => 75];
        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/portal/admin/qualis/{$qualis->id}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('qualis', [
            'id'    => $qualis->id,
            'code'  => 'B2',
            'score' => 75,
        ]);
    }

    public function test_update_qualis_fails_validation_on_bad_data()
    {
        $qualis = StratumQualis::factory()->create([
            'code'  => 'A2',
            'score' => 90,
        ]);

        $token = $this->authenticateAdmin();

        $payload = ['code' => '', 'score' => 'not_a_number'];
        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/portal/admin/qualis/{$qualis->id}", $payload);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors(['code', 'score']);

        $this->assertDatabaseHas('qualis', [
            'id'    => $qualis->id,
            'code'  => 'A2',
            'score' => 90,
        ]);
    }
}
