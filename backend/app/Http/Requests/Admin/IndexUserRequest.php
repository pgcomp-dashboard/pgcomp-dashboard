<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseIndexRequest;
use Illuminate\Validation\Rule;

class IndexUserRequest extends BaseIndexRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userFields = ['name', 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin'];
        $sortFields = [];
        foreach ($userFields as $field) {
            $sortFields[] = $field;
            $sortFields[] = '-' . $field;
        }

        return array_merge(parent::rules(), [
            'filter.name' => 'sometimes|string|max:255',
            'filter.type' => 'sometimes|string',
            'filter.email' => 'sometimes|string|email',
            'filter.siape' => 'sometimes|string',
            'filter.registration' => 'sometimes|string',
            'filter.category' => 'sometimes|string',
            'filter.admin_status' => 'sometimes|string',
            'filter.is_admin' => 'sometimes|boolean',
            'sort' => ['sometimes', 'string', Rule::in($sortFields)],
        ]);
    }
}
