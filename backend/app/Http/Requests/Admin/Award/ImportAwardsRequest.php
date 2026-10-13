<?php

namespace App\Http\Requests\Admin\Award;

use App\Enums\AwardRecipientType;
use App\Enums\AwardScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportAwardsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function validationData(): array
    {
        return ['awards' => $this->all()];
    }

    public function rules(): array
    {
        return [
            'awards' => ['required', 'array', 'min:1', 'max:500'],
            'awards.*' => ['required', 'array'],
            'awards.*.year' => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            'awards.*.scope' => ['required', Rule::enum(AwardScope::class)],
            'awards.*.award_category_name' => ['required', 'string', 'exists:award_categories,name'],
            'awards.*.description' => ['required', 'string', 'min:10', 'max:5000'],
            'awards.*.url' => ['nullable', 'url', 'max:2048'],
            'awards.*.winners' => ['required', 'array', 'min:1', 'max:20'],
            'awards.*.winners.*.name' => ['required', 'string', 'min:2', 'max:255'],
            'awards.*.winners.*.recipient_type' => ['required', Rule::enum(AwardRecipientType::class)],
        ];
    }
}
