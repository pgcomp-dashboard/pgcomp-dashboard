<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Enums\UserCategory;
use App\Rules\UniqueUserEmail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $normalized = [];
        foreach (['email', 'secondary_email'] as $field) {
            if ($this->has($field)) {
                $normalized[$field] = strtolower(trim((string) $this->input($field)));
            }
        }
        $this->merge($normalized);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = User::find($this->route('user') ?? $this->route('id'));
        $isStudent = $this->input('type', $user?->type?->value) === 'student';
        $emailRules = $isStudent
            ? [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'regex:/^[^@\s]+@ufba\.br$/i',
                new UniqueUserEmail($user?->id),
            ]
            : [
                'sometimes',
                'nullable',
                'string',
                'email:rfc',
                'max:255',
                new UniqueUserEmail($user?->id),
            ];
        $secondaryEmailRules = $isStudent
            ? [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'different:email',
                new UniqueUserEmail($user?->id),
            ]
            : [
                'sometimes',
                'nullable',
                'string',
                'email:rfc',
                'max:255',
                new UniqueUserEmail($user?->id),
            ];

        return [
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', 'string', Rule::in(['student', 'professor', 'manager'])],
            'category' => ['sometimes', new Enum(UserCategory::class)],
            'email' => $emailRules,
            'secondary_email' => $secondaryEmailRules,
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
