<?php

namespace App\Models;

use App\Enums\InternationalizationFileSlot;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternationalizationFile extends Model
{
    protected $fillable = ['action_id', 'slot', 'path', 'name'];

    protected $casts = [
        'slot' => InternationalizationFileSlot::class,
    ];

    public function action(): BelongsTo
    {
        return $this->belongsTo(InternationalizationAction::class, 'action_id');
    }
}
