<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Validation\Rule;

class Conference extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'initials',
        'name',
        'category',
        'link',
        'ce_indicated',
        'h5',
        'last_qualis',
        'logs',
        'h5_old',
        'use_scholar',
        'qualis_2016',
        'qualis_without_induction',
        'sbc_adjustment_or_event',
        'qualis_2016_id',
        'qualis_without_induction_id',
    ];

    protected $casts = [
        'use_scholar' => 'boolean',
        'qualis_2016_id' => 'integer',
        'qualis_without_induction_id' => 'integer',
    ];

    public static function creationRules(): array
    {
        return [
            'initials' => 'string|max:255|required',
            'name' => 'string|max:255|required',
            'category' => 'integer',
            'link' => 'string|max:500|nullable',
            'ce_indicated' => 'string|max:255|nullable',
            'h5' => 'string|max:255|nullable',
            'last_qualis' => 'string|max:255|nullable',
            'logs' => 'string|max:255|nullable',
            'h5_old' => 'string|max:255|nullable',
            'use_scholar' => 'boolean',
            'qualis_2016' => 'string|max:255|nullable',
            'qualis_without_induction' => 'string|max:255|nullable',
            'sbc_adjustment_or_event' => 'string|max:255|nullable',
            'qualis_2016_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
            'qualis_without_induction_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
        ];
    }

    public static function updateRules(): array
    {
        return [
            'initials' => 'string|max:255|required',
            'name' => 'string|max:255|required',
            'category' => 'integer',
            'link' => 'string|max:500|nullable',
            'ce_indicated' => 'string|max:255|nullable',
            'h5' => 'string|max:255|nullable',
            'last_qualis' => 'string|max:255|nullable',
            'logs' => 'string|max:255|nullable',
            'h5_old' => 'string|max:255|nullable',
            'use_scholar' => 'boolean',
            'qualis_2016' => 'string|max:255|nullable',
            'qualis_without_induction' => 'string|max:255|nullable',
            'sbc_adjustment_or_event' => 'string|max:255|nullable',
            'qualis_2016_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
            'qualis_without_induction_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
        ];
    }
}
