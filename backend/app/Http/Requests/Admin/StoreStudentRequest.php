<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'type' => UserType::STUDENT->value
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'type' => ['required', new Enum(UserType::class)],
            'registration' => 'required|int',
            'course_id' => 'required|int|exists:courses,id',
        ];
    }
}
