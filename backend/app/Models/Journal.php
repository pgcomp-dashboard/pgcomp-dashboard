<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class Journal extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'stratum_qualis_id',
        'issn',
        'name',
        'sbc_adjustment',
        'scopus_url',
        'percentile',
        'last_qualis',
        'update_date',
        'tentative_date',
        'logs',
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
            'sbc_adjustment' => 'string|nullable|max:255',
            'scopus_url' => 'string|nullable|max:255',
            'percentile' => 'string|nullable|max:255',
            'last_qualis' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
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
            'sbc_adjustment' => 'string|nullable|max:255',
            'scopus_url' => 'string|nullable|max:255',
            'percentile' => 'string|nullable|max:255',
            'last_qualis' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
        ];
    }

    public static function createOrUpdateJournal(array $data): Journal
    {
        return Journal::updateOrCreateModel(
            Arr::only($data, ['name']),
            $data
        );
    }

    public function stratumQualis(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(StratumQualis::class, 'stratum_qualis_id');
    }

    public function deleteJournal($title): bool
    {
        $journal = Journal::where('name', $title)->firstOrFail();
        return $journal->delete();
    }
}
