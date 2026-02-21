<?php

namespace App\Http\Requests\User;

use App\Enums\PublisherType;
use App\Enums\ProductionSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rule;

class UpdateProductionRequest extends FormRequest
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
            'users_id' => 'sometimes|exists:users,id',
            'title' => 'sometimes|string|max:500',
            'year' => 'sometimes|integer',
            'publisher_type' => ['sometimes', new Enum(PublisherType::class)],
            'publisher_id' => 'nullable|exists:publishers,id',
            'doi' => [
                'nullable',
                'string',
                Rule::unique('productions', 'doi')->ignore($this->route('production') ?? $this->route('id')),
            ],
            'source' => ['sometimes', new Enum(ProductionSource::class)],
        ];
    }
}
