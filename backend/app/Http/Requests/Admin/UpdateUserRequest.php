<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

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
            'type' => ['sometimes', 'string', Rule::in(['student', 'professor', 'manager'])],
            'category' => ['sometimes', new Enum(UserCategory::class)],
            'email' => [
                'sometimes',
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user') ?? $this->route('id')),
            ],
            'password' => 'sometimes|string|min:8',
            'is_admin' => 'sometimes|boolean',
            'registration' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::unique('users', 'registration')->ignore($this->route('user') ?? $this->route('id')),
            ],
            'siape' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::unique('users', 'siape')->ignore($this->route('user') ?? $this->route('id')),
            ],
            'course_id' => 'sometimes|nullable|integer|exists:courses,id',
            'area_id' => 'sometimes|nullable|integer|exists:areas,id',
            'lattes_url' => 'sometimes|nullable|string|max:255',
            'defended_at' => 'sometimes|nullable|date',
            'pq' => 'sometimes|boolean',
            'is_senior' => 'sometimes|boolean',
            'orcid' => 'sometimes|nullable|string|max:255',
        ];
    }
}
