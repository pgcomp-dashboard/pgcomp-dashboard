<?php

namespace App\Http\Requests\Admin;

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
        // Get base rules
        $rules = User::creationRules();

        // Enforce Professor specifics locally to be sure
        $rules['type'] = ['required', new Enum(UserType::class)];
        $rules['siape'] = 'required|int';
        // Note: The model says 'required_if:type,probessor', but since we force type=professor, it is effectively required.

        return $rules;
    }
}
