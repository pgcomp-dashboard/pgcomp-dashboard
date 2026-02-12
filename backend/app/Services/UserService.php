<?php

namespace App\Services;

use App\Enums\UserType;
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
            $data['type'] = UserType::STUDENT;
            $data['password'] = Hash::make(Str::random(12));
            $user = User::create($data);
        }

        if (isset($data['advisor_id'])) {
            $user->advisors()->sync($data['advisor_id']);
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
            $data['type'] = UserType::PROFESSOR;
            $data['password'] = Hash::make(Str::random(12));
            $user = User::create($data);
        }

        return $user;
    }

    /**
     * List all professors.
     */
    public function listProfessors()
    {
        return User::professors()->get();
    }

    /**
     * Find a professor by ID.
     */
    public function findProfessor(int $id): User
    {
        return User::professors()->findOrFail($id);
    }

    /**
     * List all students.
     */
    public function listStudents()
    {
        return User::students()->get();
    }

    /**
     * Find a student by ID.
     */
    public function findStudent(int $id): User
    {
        return User::students()->findOrFail($id);
    }
}
