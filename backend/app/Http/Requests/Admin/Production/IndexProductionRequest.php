<?php

namespace App\Http\Requests\Admin\Production;

use App\Http\Requests\BaseIndexRequest;
use Illuminate\Validation\Rule;

class IndexProductionRequest extends BaseIndexRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'filter.title' => 'sometimes|string|max:255',
            'filter.year' => 'sometimes|integer|min:1900|max:' . date('Y'),
            'filter.publisher_type' => ['sometimes', 'string', Rule::in(['journal', 'conference'])],
            'filter.source' => 'sometimes|string',
            'sort' => ['sometimes', 'string', Rule::in(['title', '-title', 'year', '-year', 'created_at', '-created_at'])],
        ]);
    }
}
