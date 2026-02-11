<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    /**
     * Store a new user.
     */
    public function store(array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            $data['password'] = Hash::make(Str::random(12));
        }

        return User::create($data);
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): User
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        return $user;
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Create or update a user of type student.
     */
    public function createOrUpdateStudent(array $data): User
    {
        $user = User::where('registration', $data['registration'])->first();

        if ($user) {
            $user->update($data);
        } else {
            $data['type'] = \App\Enums\UserType::STUDENT;
            $data['password'] = Hash::make(Str::random(12));
            $user = User::create($data);
        }

        return $user;
    }

    /**
     * Create or update a user of type professor by scraping.
     */
    public function createOrUpdateTeacherByScraping(array $data): User
    {
        $user = User::where('siape', $data['siape'])->first();

        if ($user) {
            $user->update($data);
        } else {
            $data['type'] = \App\Enums\UserType::PROFESSOR;
            $data['password'] = Hash::make(Str::random(12));
            $user = User::create($data);
        }

        return $user;
    }
}
