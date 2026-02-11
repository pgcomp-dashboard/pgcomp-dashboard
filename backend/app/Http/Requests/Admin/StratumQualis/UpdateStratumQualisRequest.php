<?php

namespace App\Http\Requests\Admin\StratumQualis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStratumQualisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $qualisId = $this->route('qualis');

        return [
            'type' => 'sometimes|string|in:journal,conference',
            'code' => [
                'sometimes',
                'string',
                'max:2',
                Rule::unique('stratum_qualis')
                    ->where(fn ($query) =>
                        $query->where('type', $this->type)
                            ->where('code', $this->code)
                    )
                    ->ignore($qualisId),
            ],
            'score' => 'sometimes|decimal:0,2',
        ];
    }
}
