<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\Rule;

class Publishers extends BaseModel
{
    //

    protected $fillable = [
        'id',
        'initials',
        'name',
        'publisher_type',
        'issn',
        'scopus_url',
        'sbc_adjustment',
        'percentile',
        'update_date',
        'tentative_date',
        'logs',
        'stratum_qualis_id',
    ];

    public static function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'issn' => 'string|nullable|max:255',
            'percentile' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
            'initials' => 'string|max:255|nullable',
            'publisher_type' => 'nullable|in:journal,conference',
        ];
    }

    public function updateRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'issn' => 'string|nullable|max:255',
            'percentile' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
            'initials' => 'string|max:255|nullable',
            'publisher_type' => 'nullable|in:journal,conference',
        ];
    }

    public function stratumQualis(): BelongsTo
    {
        return $this->belongsTo(StratumQualis::class, 'stratum_qualis_id');
    }
}
