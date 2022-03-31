<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends BaseModel
{
    use HasFactory;

    protected $fillable = ['name'];

    public static function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
        ];
    }

    public static function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
        ];
    }
}
