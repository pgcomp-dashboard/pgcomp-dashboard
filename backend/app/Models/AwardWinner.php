<?php

namespace App\Models;

use App\Enums\AwardRecipientType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AwardWinner extends Model
{
    protected $fillable = ['award_id', 'name', 'recipient_type'];

    protected $casts = [
        'recipient_type' => AwardRecipientType::class,
    ];

    public function award(): BelongsTo
    {
        return $this->belongsTo(Award::class);
    }
}
