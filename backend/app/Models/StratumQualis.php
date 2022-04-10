<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;

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

    public function updateRules(): array
    {
        return [
            'code' => 'string|max:2',
            'score' => 'int',
        ];
    }

    public function findAll() {
        return StratumQualis::all();
    }

    public function deleteStratumQualis($code)
    {
        $stratum = StratumQualis::where('code', $code)->firstOrFail();
        $stratum->delete();
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
}
