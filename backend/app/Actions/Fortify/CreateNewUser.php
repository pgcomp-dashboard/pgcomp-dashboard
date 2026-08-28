<?php

namespace App\Actions\Fortify;

use Illuminate\Support\Facades\Mail;
use App\Mail\AdminMail;
use App\Mail\RegistrationMail;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @return \App\Models\User
     */
    public function create(array $input)
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'type' => ['required', Rule::in([UserType::PROFESSOR->value])],
        ], [
            'type.in' => 'Atualmente, apenas docentes podem se cadastrar no sistema.',
        ])->validate();

        $user = new User([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'type' => UserType::PROFESSOR,
        ]);

        // Professors always start as unapproved
        $user->is_approved = false;
        $user->save();

        Mail::to(["deividsantos@ufba.br", "pgcomp@ufba.br",  "fdurao@ufba.br","dashboardpgcomp@gmail.com"])->send(new AdminMail($user, 'new_registration'));
        Mail::to($user->email)->send(new RegistrationMail($user, 'new_registration'));

        return $user;
    }
}
