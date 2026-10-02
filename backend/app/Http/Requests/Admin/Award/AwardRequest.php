<?php

namespace App\Http\Requests\Admin\Award;

use App\Enums\AwardRecipientType;
use App\Enums\AwardScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AwardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'winners' => ['required', 'array', 'min:1', 'max:20'],
            'winners.*.name' => ['required', 'string', 'min:2', 'max:255'],
            'winners.*.recipient_type' => ['required', Rule::enum(AwardRecipientType::class)],
            'year' => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            'scope' => ['required', Rule::enum(AwardScope::class)],
            'award_category_id' => ['required', 'integer', 'exists:award_categories,id'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'url' => ['nullable', 'url', 'max:2048'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,gif,webp', 'max:10240'],
            'remove_attachment' => ['nullable', 'boolean'],
        ];
    }
}
