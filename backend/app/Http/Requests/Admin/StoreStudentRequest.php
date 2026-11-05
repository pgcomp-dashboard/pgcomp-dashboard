<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserType;
use App\Rules\UniqueUserEmail;
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
            'type' => UserType::STUDENT->value,
            'email' => strtolower(trim((string) $this->input('email'))),
            'secondary_email' => strtolower(trim((string) $this->input('secondary_email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'regex:/^[^@\s]+@ufba\.br$/i',
                new UniqueUserEmail(),
            ],
            'secondary_email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'different:email',
                new UniqueUserEmail(),
            ],
            'password' => 'sometimes|nullable|string|min:8',
            'type' => ['required', new Enum(UserType::class)],
            'registration' => 'required|int',
            'course_id' => 'required|int|exists:courses,id',
            'area_id' => 'required|int|exists:areas,id',
            'lattes_url' => 'nullable|string|max:255',
            'defended_at' => 'nullable|date',
        ];
    }
}
