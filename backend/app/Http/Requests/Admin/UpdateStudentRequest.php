<?php

namespace App\Http\Requests\Admin;

use App\Rules\UniqueUserEmail;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
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
        $userId = (int) ($this->route('student') ?? $this->route('id'));

        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'regex:/^[^@\s]+@ufba\.br$/i',
                new UniqueUserEmail($userId),
            ],
            'secondary_email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'different:email',
                new UniqueUserEmail($userId),
            ],
            'password' => 'sometimes|string|min:8',
            'registration' => 'nullable|int',
            'course_id' => 'sometimes|required|int|exists:courses,id',
            'area_id' => 'sometimes|nullable|int|exists:areas,id',
            'lattes_url' => 'sometimes|nullable|string|max:255',
            'defended_at' => 'sometimes|nullable|date',
        ];
    }
}
