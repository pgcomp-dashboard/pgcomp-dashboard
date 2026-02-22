<?php

namespace App\Http\Requests\Admin\Publisher;

use App\Models\StratumQualis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublisherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'issns' => 'array|nullable',
            'issns.*' => [
                'string',
                'max:255',
                Rule::unique('publisher_issns', 'issn'),
            ],
            'percentile' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
            'initials' => 'string|max:255|nullable',
            'publisher_type' => 'nullable|in:journal,conference',
        ];
    }
}
