<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_login_successful_returns_token()
    {
        $password = 'secret123';
        $user = User::factory()->create([
            'email'    => 'test+' . uniqid() . '@example.com',
            'password' => Hash::make($password),
            'type'     => 'guest',
        ]);
        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => $password,
        ]);

        
        $response->assertStatus(200)
                 ->assertJsonStructure(['token'])
                 ->assertJson(fn ($json) =>
                     $json->whereType('token', 'string')->etc()
                 );
    }

    public function test_login_fails_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'password' => Hash::make('right_password'),
            'type'     => 'guest',
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401);
    }
}
