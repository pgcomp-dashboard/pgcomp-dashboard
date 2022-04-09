<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
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

    public function findAreaByName($name): self
    {
        return Area::where('area_name', $name)->firstOrFail();
    }
}
