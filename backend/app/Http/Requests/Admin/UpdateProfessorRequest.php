<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateProfessorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
         $userId = $this->route('professor');

         return [
            'name'  => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'siape' => [
                'sometimes',
                'integer',
                Rule::unique('users', 'siape')->ignore($userId),
            ],
            'category' => [
                'sometimes',
                new Enum(UserCategory::class),
            ],
            'is_admin' => 'sometimes|boolean',
        ];
    }
}
