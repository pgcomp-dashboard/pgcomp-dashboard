<?php

namespace App\Http\Requests\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDefenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type = (string) $this->input('type');
        // As confirmações são do orientador; o discente envia sem elas.
        $withConfirmations = $this->user()->type !== UserType::STUDENT;

        return array_merge(
            [
                'type' => ['required', 'string', Rule::in(DefenseRequestForms::types())],
                'data' => ['required', 'array'],
                'student_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('type', UserType::STUDENT->value)],
            ],
            // Os campos de "data" dependem do tipo escolhido.
            DefenseRequestForms::get($type) ? DefenseRequestForms::rules($type, $withConfirmations) : [],
        );
    }

    public function attributes(): array
    {
        return DefenseRequestForms::attributes((string) $this->input('type'));
    }
}
