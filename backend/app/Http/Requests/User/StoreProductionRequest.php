<?php

namespace App\Http\Requests\User;

use App\Enums\PublisherType;
use App\Enums\ProductionSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreProductionRequest extends FormRequest
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
            'title' => 'required|string|max:500',
            'year' => 'required|integer',
            'publisher_type' => ['required', new Enum(PublisherType::class)],
            'publisher_id' => 'nullable|exists:publishers,id',
            'doi' => 'nullable|string|unique:productions,doi',
            'source' => ['sometimes', new Enum(ProductionSource::class)],
        ];
    }
}
