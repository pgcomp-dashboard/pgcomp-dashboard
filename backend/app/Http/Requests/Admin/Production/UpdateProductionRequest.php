<?php

namespace App\Http\Requests\Admin\Production;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['string', 'max:255'],
            'year' => 'int|date_format:Y',
            'publisher_type' => ['nullable', 'string', 'max:255', 'required_with:publisher_id'],
            'publisher_id' => ['nullable', 'int', 'exists:publishers,id'],
            'doi' => ['nullable', 'string', 'max:255'],
            'sequence_number' => 'nullable|int',
            'source' => 'nullable|string|max:255',
            'stratum_qualis_id' => 'nullable|int|exists:stratum_qualis,id'
        ];
    }
}
