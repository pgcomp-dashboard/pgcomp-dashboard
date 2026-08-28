<?php

namespace App\Http\Requests\Admin\Publisher;

use App\Http\Requests\BaseIndexRequest;
use Illuminate\Validation\Rule;

class IndexPublisherRequest extends BaseIndexRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'filter.name' => 'sometimes|string|max:255',
            'filter.initials' => 'sometimes|string|max:50',
            'filter.issn' => 'sometimes|string|max:20',
            'filter.publisher_type' => ['sometimes', 'string', Rule::in(['journal', 'conference'])],
            'filter.stratum_qualis_id' => 'sometimes|integer|exists:stratum_qualis,id',
            'filter.qualis_code' => 'sometimes|string|max:10',
            'sort' => ['sometimes', 'string', Rule::in(['name', '-name', 'initials', '-initials', 'issn', '-issn', 'publisher_type', '-publisher_type', 'stratum_qualis_id', '-stratum_qualis_id', 'qualis_code', '-qualis_code'])],
        ]);
    }
}
