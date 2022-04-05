<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;

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

    public function findSubareaByName($name){
        $subarea = Subarea::where('subarea_name', $name)->firstOrFail();
        if(empty($subarea)){
            return "error";
        }
        return $subarea;
    }

    public function deleteSubareaByName($name){
        $subarea = Subarea::where('subarea_name', $name)->firstOrFail();
        if(empty($subarea)){
            return "error";
        }
    }
     
}
