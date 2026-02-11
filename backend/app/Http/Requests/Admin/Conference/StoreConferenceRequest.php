<?php

namespace App\Http\Requests\Admin\Conference;

use App\Models\StratumQualis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConferenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'initials' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'category' => 'integer|nullable',
            'link' => 'string|max:500|nullable',
            'ce_indicated' => 'string|max:255|nullable',
            'h5' => 'string|max:255|nullable',
            'last_qualis' => 'string|max:255|nullable',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'logs' => 'string|max:255|nullable',
            'h5_old' => 'string|max:255|nullable',
            'use_scholar' => 'boolean',
            'qualis_2016' => 'string|max:255|nullable',
            'qualis_without_induction' => 'string|max:255|nullable',
            'sbc_adjustment_or_event' => 'string|max:255|nullable',
            'qualis_2016_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
            'qualis_without_induction_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
        ];
    }
}
