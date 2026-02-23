<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublisherIssn extends Model
{
    protected $fillable = [
        'publishers_id',
        'issn',
    ];

    public function setIssnAttribute($value)
    {
        $this->attributes['issn'] = str_replace('-', '', (string)$value);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publishers::class, 'publishers_id');
    }
}
