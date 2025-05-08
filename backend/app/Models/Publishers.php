<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Publishers extends Model
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
        'stratum_qualis_id'
    ];
    public function stratumQualis(): HasMany
    {
        return $this->hasMany(StratumQualis::class, 'stratum_qualis_id');
    }
    public static function updateOrCreate(array $attributes, array $values = [], array $updateOptions = []): static
    {

        $model = static::where($attributes)->first();
        if (empty($model)) {
            return static::create(array_merge($attributes, $values));
        }

        $model->update(array_merge($attributes, $values), $updateOptions);

        return $model;
    }
}
