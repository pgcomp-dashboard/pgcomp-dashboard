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
        $rules = User::creationRules();

        $rules['type'] = ['required', new Enum(UserType::class)];
        $rules['registration'] = 'required|int';
        $rules['course_id'] = 'required|int|exists:courses,id';

        return $rules;
    }
}
