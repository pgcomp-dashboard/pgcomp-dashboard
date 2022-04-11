<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

/**
 * App\Models\StratumQualis
 *
 * @property int $id
 * @property string $code
 * @property int $score
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|StratumQualis newModelQuery()
 * @method static Builder|StratumQualis newQuery()
 * @method static Builder|StratumQualis query()
 * @method static Builder|StratumQualis whereCode($value)
 * @method static Builder|StratumQualis whereCreatedAt($value)
 * @method static Builder|StratumQualis whereId($value)
 * @method static Builder|StratumQualis whereScore($value)
 * @method static Builder|StratumQualis whereUpdatedAt($value)
 * @mixin Eloquent
 */
class StratumQualis extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'code',
        'score',
    ];

    public static function creationRules(): array
    {
        return [
            'code' => 'required|string|max:2',
            'score' => 'required|int',
        ];
    }

    public static function createOrUpdateStratumQualis(array $data): StratumQualis
    {
        return StratumQualis::updateOrCreate(
            Arr::only($data, ['code']),
            $data
        );
    }

    public static function findByCode(string $code, array $columns = ['*']): self
    {
        return self::where('code', $code)->firstOrFail($columns);
    }

    public function updateRules(): array
    {
        return [
            'code' => 'string|max:2',
            'score' => 'int',
        ];
    }

    public function findAll()
    {
        return StratumQualis::all();
    }

    public function deleteStratumQualis($code)
    {
        $stratum = StratumQualis::where('code', $code)->firstOrFail();
        $stratum->delete();
    }
}
