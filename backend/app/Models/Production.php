<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * App\Models\Production
 *
 * @property int $id
 * @property string $title
 * @property int $year
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $publisher_type
 * @property int|null $publisher_id
 * @property string|null $last_qualis
 * @property int|null $stratum_qualis_id
 * @property int|null $sequence_number
 * @property string|null $doi
 * @property string|null $source
 * @property-read Collection|User[] $isWroteBy
 * @property-read int|null $is_wrote_by_count
 * @property-read Model|Eloquent $publisher
 *
 * @method static Builder|Production newModelQuery()
 * @method static Builder|Production newQuery()
 * @method static Builder|Production query()
 * @method static Builder|Production whereCreatedAt($value)
 * @method static Builder|Production whereDoi($value)
 * @method static Builder|Production whereId($value)
 * @method static Builder|Production whereLastQualis($value)
 * @method static Builder|Production wherePublisherId($value)
 * @method static Builder|Production wherePublisherType($value)
 * @method static Builder|Production whereSequenceNumber($value)
 * @method static Builder|Production whereStratumQualisId($value)
 * @method static Builder|Production whereTitle($value)
 * @method static Builder|Production whereUpdatedAt($value)
 * @method static Builder|Production whereYear($value)
 * @method static void saveInterTable()
 * @method static void removeInterTable()
 *
 * @mixin Eloquent
 */
class Production extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'title',
        'year',
        'publisher_type',
        'publisher_id',
        'doi',
        'source',
        'stratum_qualis_id'
    ];

    /**
     * @return array creation rules to validate attributes.
     */
    public static function creationRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', Rule::unique(Production::class, 'title')->whereNull('doi')],
            'year' => 'required|int|date_format:Y',
            'publisher_type' => ['nullable', 'string', 'max:255'],
            'publisher_id' => ['nullable', 'int', 'exists:publishers,id'],
            'doi' => ['nullable', 'string', 'max:255', Rule::unique(Production::class, 'doi')],
            'sequence_number' => 'nullable|int',
            'source' => 'nullable|string|max:255',
            'stratum_qualis_id' => 'nullable|int'
        ];
    }

    /**
     * boot the model by setting the production qualis
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function (self $production) {
            $production->setQualis();
        });

        static::updating(function (self $production) {
            $production->setQualis();
        });

        static::deleting(function (self $production) {
            $production->isWroteBy()->detach();
        });
    }

    /**
     * Establishes a relationship of belonging-to-many with the user model. When the user write the production.
     *
     * @return BelongsToMany a user can have several products
     */
    public function isWroteBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_productions', 'productions_id', 'users_id');
    }

    /**
     * Establishes a relationship of belonging-to-many with the user model. When the user write the production.
     *
     * @return BelongsTo a user can have several products
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publishers::class, 'publisher_id', 'id');
    }

    /**
     * Scope a query to include only productions of a specific user.
     */
    public function scopeOfUser($query, $userId)
    {
        return $query->whereHas('isWroteBy', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        });
    }

    /**
     * Scope a query to include only productions written by users of a specific type.
     */
    public function scopeOfUserType($query, $type)
    {
        return $query->whereHas('isWroteBy', function ($q) use ($type) {
            $q->where('users.type', $type);
        });
    }

    /**
     * Scope a query to eager load publisher and its stratum qualis.
     */
    public function scopeWithPublisherAndQualis($query)
    {
        return $query->with(['publisher', 'publisher.stratumQualis']);
    }

    /**
     * @return array update rules to validate attributes.
     */
    public function updateRules(): array
    {
        return [
            'title' => 'string|max:255',
            'year' => 'int|date_format:Y',
            'publisher_type' => ['nullable', 'required_with:publisher_id', 'string', 'max:255'],
            'publisher_id' => ['nullable', 'int', 'exists:publishers,id'],
            'sequence_number' => 'nullable|int',
            'source' => 'nullable|string|max:255',
            'stratum_qualis_id' => 'nullable|int'
        ];
    }

    /**
     * Insert related models when working with many-to-many relations
     *
     * @param int id to create the relationship between production and user
     */
    public function saveInterTable($users_id): void
    {
        $this->isWroteBy()->attach($users_id);
    }

    /**
     * Does the mapping and sets the stratum qualis of a given production
     */
    protected function setQualis(): void
    {
        if ($this->publisher) {
            $this->last_qualis = $this->publisher->last_qualis;
            $this->stratum_qualis_id = $this->publisher->stratum_qualis_id;
        }
    }
}
