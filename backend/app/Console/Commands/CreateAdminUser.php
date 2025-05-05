<?php

namespace App\Console\Commands;

use App\Enums\UserType;
use App\Models\User;
use Hash;
use Illuminate\Console\Command;
use Illuminate\Validation\ValidationException;
use Log;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-admin
                            {--name= : (optional) The full name of the new admin}
                            {--email= : (optional) The email address}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Make a new admin user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->option('name') ?? $this->ask('Name of the new user?');
        $email = $this->option('email') ?? $this->ask('Email of the new user?');
        $pass = $this->secret('Password for the new user');

        if (User::whereEmail($email)->exists()) {
            $this->error("A user with email [{$email}] already exists.");
            return 1;
        }

        $hash = Hash::make($pass);

        try {
            $user = User::create([
                'name' => $name,
                'type' => UserType::GUEST,
                'email' => $email,
                'password' => $hash,
                'password_confirmation' => $hash,
                'is_admin' => true,
            ]);
        } catch (ValidationException $e) {
            $this->error("Failed to validate new user: " . $e->getMessage());
            return 2;
        }

        $this->info("✅ Admin user [{$user->email}] created successfully.");
        return 0;
    }
}
