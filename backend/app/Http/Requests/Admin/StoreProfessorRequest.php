<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserCategory;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreProfessorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'type' => UserType::PROFESSOR->value
        ]);
    }

    public function rules(): array
    {
        return [
            'name'  => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email'),
            ],
            'siape' => [
                'sometimes',
                'integer',
                Rule::unique('users', 'siape'),
            ],
            'category' => [
                'sometimes',
                new Enum(UserCategory::class),
            ],
            'pq' => 'sometimes|boolean|nullable',
            'is_senior' => 'sometimes|boolean|nullable',
        ];
    }
}
