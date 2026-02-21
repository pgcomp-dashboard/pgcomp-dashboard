<?php

namespace App\Http\Requests\Admin\Course;

use App\Http\Requests\BaseIndexRequest;
use Illuminate\Validation\Rule;

class IndexCourseRequest extends BaseIndexRequest
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
            'sort' => ['sometimes', 'string', Rule::in(['name', '-name'])],
        ]);
    }
}
