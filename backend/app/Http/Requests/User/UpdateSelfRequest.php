<?php

namespace App\Http\Requests\User;

use App\Models\Area;
use App\Models\Course;
use App\Enums\UserType;
use App\Rules\UniqueUserEmail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSelfRequest extends FormRequest
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

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $user = $this->user();
        $isStudent = $user->type === UserType::STUDENT;

        $courseIdRules = [
            'int',
            Rule::exists(Course::class, 'id'),
        ];
        if ($user->type === UserType::PROFESSOR) {
            $courseIdRules[] = 'nullable';
        }

        return [
            'name' => 'string|max:255',
            'email' => $isStudent
                ? [
                    'required',
                    'string',
                    'email:rfc',
                    'max:255',
                    'regex:/^[^@\s]+@ufba\.br$/i',
                    new UniqueUserEmail($user->id),
                ]
                : [
                    'nullable',
                    'string',
                    'email:rfc',
                    'max:255',
                    new UniqueUserEmail($user->id),
                ],
            'secondary_email' => $isStudent
                ? [
                    'required',
                    'string',
                    'email:rfc',
                    'max:255',
                    'different:email',
                    new UniqueUserEmail($user->id),
                ]
                : ['sometimes', 'nullable', 'email:rfc', 'max:255'],
            'area_id' => [
                'nullable',
                'int',
                Rule::exists(Area::class, 'id'),
            ],
            'course_id' => $courseIdRules,
            'lattes_url' => 'nullable|string|max:255',
            'pq' => 'boolean|nullable',
            'orcid' => 'nullable|string|max:255',
        ];
    }
}
