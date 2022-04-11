<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class Area extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'area_name',
        'program_id',
    ];

    public function belongsToTheProgram()
    {
        return $this->hasOne(Program::class, 'program_id');
    }

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

    public static function updateRules(): array
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

    public static function createOrUpdateArea(array $data): Area
    {
        return Area::updateOrCreateModel(
            Arr::only($data, ['area_name']),
            $data
        );
    }

    public function findAreaByName($name){
        $area = Area::where('area_name', $name)->firstOrFail();
        if(empty($area)){
            return "error";
        }
        return $area;
    }

    public function deleteAreaByName($name){
        $area = Area::where('area_name', $name)->firstOrFail();
        if(empty($area)){
            return "error";
        }
        $area-delete();
    }

}
