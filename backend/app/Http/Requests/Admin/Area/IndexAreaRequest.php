<?php

namespace App\Http\Requests\Admin\Area;

use App\Http\Requests\BaseIndexRequest;
use Illuminate\Validation\Rule;

class IndexAreaRequest extends BaseIndexRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'filter.area' => 'sometimes|string|max:255',
            'sort' => ['sometimes', 'string', Rule::in(['area', '-area'])],
        ]);
    }
}
