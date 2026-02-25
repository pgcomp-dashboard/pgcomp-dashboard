<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user') ?? $this->route('id')),
            ],
            'password' => 'sometimes|string|min:8',
            'is_admin' => 'sometimes|boolean',
            'orcid' => 'sometimes|nullable|string|max:255',
        ];
    }
}
