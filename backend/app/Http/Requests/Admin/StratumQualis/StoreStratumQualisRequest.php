<?php

namespace App\Http\Requests\Admin\StratumQualis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStratumQualisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:journal,conference',
            'code' => [
                'required',
                'string',
                'max:2',
                Rule::unique('stratum_qualis')->where(fn ($query) =>
                    $query->where('type', $this->type)
                        ->where('code', $this->code)
                ),
            ],
            'score' => 'required|decimal:0,2',
        ];
    }

    public function messages(): array
    {
            return [
                'code.unique' => 'Esse código já está definido para o tipo selecionado.',
            ];
    }
}
