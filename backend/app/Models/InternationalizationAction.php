<?php

namespace App\Models;

use App\Enums\InternationalizationCourse;
use App\Enums\InternationalizationLattesStatus;
use App\Enums\InternationalizationLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternationalizationAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'full_name',
        'registration_number',
        'level',
        'course',
        'lattes_status',
        'advisor_name',
        'country',
        'institution',
        'foreign_research_group',
        'foreign_researcher',
        'description',
        'start_date',
        'end_date',
        'call_notice',
        'url',
    ];

    protected $casts = [
        'level' => InternationalizationLevel::class,
        'course' => InternationalizationCourse::class,
        'lattes_status' => InternationalizationLattesStatus::class,
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(InternationalizationCategory::class, 'category_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(InternationalizationFile::class, 'action_id');
    }

    public function scopeOfUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
