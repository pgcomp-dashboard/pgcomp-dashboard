<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\Rule;

class Publishers extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'initials',
        'name',
        'publisher_type',
        'scopus_url',
        'sbc_adjustment',
        'percentile',
        'update_date',
        'tentative_date',
        'logs',
        'stratum_qualis_id',
    ];

    public function issns(): HasMany
    {
        return $this->hasMany(PublisherIssn::class, 'publishers_id');
    }


    public function stratumQualis(): BelongsTo
    {
        return $this->belongsTo(StratumQualis::class, 'stratum_qualis_id');
    }

    public function scopeOnlyJournals($query){
        return $query->where('publisher_type', 'journal');
    }

    public function scopeOnlyConferences($query){
        return $query->where('publisher_type', 'conference');
    }
}
