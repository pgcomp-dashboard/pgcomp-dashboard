<?php

namespace App\Models;

use App\Enums\AwardScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Award extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'year',
        'scope',
        'award_category_id',
        'description',
        'url',
        'attachment_path',
        'attachment_name',
    ];

    protected $casts = [
        'year' => 'integer',
        'scope' => AwardScope::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function winners(): HasMany
    {
        return $this->hasMany(AwardWinner::class)->orderBy('id');
    }

    public function scopeOfUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AwardCategory::class, 'award_category_id');
    }
}
