<?php

namespace App\Http\Requests\Admin\Production;

use App\Enums\PublisherType;
use App\Enums\ProductionSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'users_id' => 'required|exists:users,id',
            'title' => 'required|string|max:500',
            'year' => 'required|integer',
            'publisher_type' => ['required', new Enum(PublisherType::class)],
            'publisher_id' => 'nullable|exists:publishers,id',
            'doi' => 'nullable|string|unique:productions,doi',
            'source' => ['required', new Enum(ProductionSource::class)],
        ];
    }
}
