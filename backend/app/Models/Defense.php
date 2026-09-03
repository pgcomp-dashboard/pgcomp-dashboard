<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * App\Models\Defense
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $course_id
 * @property Carbon $defended_at
 * @property string|null $type
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Course|null $course
 *
 * @mixin \Eloquent
 */
class Defense extends Model
{
    use HasFactory;

    public const TYPE_MESTRADO = 'mestrado';
    public const TYPE_DOUTORADO = 'doutorado';

    protected $fillable = [
        'user_id',
        'course_id',
        'defended_at',
        'type',
    ];

    protected $casts = [
        'defended_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
