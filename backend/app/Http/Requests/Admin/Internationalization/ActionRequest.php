<?php

namespace App\Http\Requests\Admin\Internationalization;

use App\Enums\InternationalizationCourse;
use App\Enums\InternationalizationFileSlot;
use App\Enums\InternationalizationLattesStatus;
use App\Enums\InternationalizationLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:internationalization_categories,id'],
            'full_name' => ['required', 'string', 'min:2', 'max:255'],
            'registration_number' => ['required', 'string', 'max:50'],
            'level' => ['required', Rule::enum(InternationalizationLevel::class)],
            'course' => ['required', Rule::enum(InternationalizationCourse::class)],
            'lattes_status' => ['required', Rule::enum(InternationalizationLattesStatus::class)],
            'advisor_name' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'foreign_research_group' => ['nullable', 'string', 'max:255'],
            'foreign_researcher' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'call_notice' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:2048'],

            // Comprovantes: 1 PDF de até 1 MB. Fotos: até 3 imagens de até 10 MB.
            'files' => ['nullable', 'array'],
            'files.document' => ['nullable', 'file', 'mimes:pdf', 'max:1024'],
            'files.photo_1' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp', 'max:10240'],
            'files.photo_2' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp', 'max:10240'],
            'files.photo_3' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp', 'max:10240'],
            'remove_files' => ['nullable', 'array'],
            'remove_files.*' => ['string', Rule::in(InternationalizationFileSlot::values())],
        ];
    }
}
