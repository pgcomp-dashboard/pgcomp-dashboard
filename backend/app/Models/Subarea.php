<?php

namespace App\Models;

use App\Enums\UserRelationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class Subarea extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'subarea_name',
        'area_id',
    ];

    public function belongsToTheArea()
    {
        return $this->hasOne(Area::class, 'area_id');
    }

    public function area(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public static function creationRules(): array
    {
        return [
            'subarea_name' => 'required|string|max:255',
            'area_id' => [
                'nullable',
                'int',
                Rule::exists(Area::class, 'id'),
                'required',
            ],
        ];
    }

    public static function updateRules(): array
    {
        return [
            'subarea_name' => 'required|string|max:255',
            'area_id' => [
                'nullable',
                'int',
                Rule::exists(Area::class, 'id'),
                'required',
            ],
        ];
    }

    public static function createOrUpdateSubarea(array $data): Subarea
    {
        return Subarea::updateOrCreateModel(
            Arr::only($data, ['subarea_name']),
            $data
        );
    }

    public function findSubareaByName($name): self
    {
        return self::where('subarea_name', $name)->firstOrFail();
    }

    public function deleteSubareaByName($name){
        $subarea = Area::where('subarea_name', $name)->first();
        if(empty($subarea)){
            return "error";
        }
    }

}
