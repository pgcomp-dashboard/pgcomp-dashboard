<?php

namespace App\Http\Requests\Admin\Internationalization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                Rule::unique('internationalization_categories', 'name')
                    ->ignore($this->route('internationalization_category')?->id),
            ],
        ];
    }
}
