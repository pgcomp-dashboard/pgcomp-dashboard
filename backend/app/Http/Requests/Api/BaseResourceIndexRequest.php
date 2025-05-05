<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BaseResourceIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'page' => 'int|min:1',
            'per_page' => 'int|min:1|max:100',
            'order_by' => 'string',
            'dir' => 'string|in:asc,desc',
            'filters' => 'array',
            'filters.*.field' => 'string|required',
            'filters.*.value' => 'required',
            'filters.*.operator' => 'string|in:in,not in,like,not like,=,!=',
        ];
    }

    public function attributes(): array
    {
        return [
            'page' => 'página',
            'per_page' => 'itens por página',
            'order_by' => 'ordenação',
            'dir' => 'direção',
            'filters' => 'filtros',
            'filters.*.field' => 'filtro: campo',
            'filters.*.value' => 'filtro: valor',
            'filters.*.operator' => 'filtro: operador',
        ];
    }
}
