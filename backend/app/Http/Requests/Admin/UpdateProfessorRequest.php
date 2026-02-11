<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfessorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
         $rules = User::updateRules();

         // Specific overrides for professor update if needed
         $rules['siape'] = 'nullable|int';

         return $rules;
    }
}
