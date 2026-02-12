<?php

namespace App\Http\Requests\Admin\Production;

use App\Enums\PublisherType;
use App\Models\Production;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return Production::creationRules();
    }
}
