<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * App\Models\Area
 *
 * @property int $id
 * @property string $area_name
 * @property int $program_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Program|null $belongsToTheProgram
 * @method static Builder|Area newModelQuery()
 * @method static Builder|Area newQuery()
 * @method static Builder|Area query()
 * @method static Builder|Area whereAreaName($value)
 * @method static Builder|Area whereCreatedAt($value)
 * @method static Builder|Area whereId($value)
 * @method static Builder|Area whereProgramId($value)
 * @method static Builder|Area whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Area extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'area_name',
        'program_id',
    ];

    public static function creationRules(): array
    {
        return [
            'area_name' => 'required|string|max:255',
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
                'required',
            ],
        ];
    }

    public function belongsToTheProgram()
    {
        return $this->hasOne(Program::class, 'program_id');
    }

    public function updateRules(): array
    {
        return [
            'area_name' => 'required|string|max:255',
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
                'required',
            ],
        ];
    }

    public function findAreaByName($name): self
    {
        return Area::where('area_name', $name)->firstOrFail();
    }

    public function deleteAreaByName($name){
        $area = Area::where('name', $name)->firstOrFail();
        return $area->delete();
    }

    public function findArea($id, $attributes = ['area_name']){
        return Area::where('id', $id)->get($attributes)->firstOrFail();
    }

}
