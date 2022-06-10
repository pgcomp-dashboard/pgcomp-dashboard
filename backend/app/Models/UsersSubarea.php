<?php

namespace App\Models;

use Illuminate\Validation\Rule;

class UsersSubarea extends BaseModel
{
    protected $fillable = [
        'users_id',
        'subareas_id',
    ];

    public static function creationRules(): array
    {
        return [
            'users_id' => [
                'int',
                'required',
                Rule::exists(User::class, 'id')
            ],
            'subareas_id' => [
                'int',
                'required',
                Rule::exists(Subarea::class, 'id')
            ],
        ];
    }

    public function updateRules(): array
    {
        return [
            'users_id' => [
                'int',
                'required',
                Rule::exists(User::class, 'id')
            ],
            'subareas_id' => [
                'int',
                'required',
                Rule::exists(Subarea::class, 'id')
            ],
        ];
    }

    public function users(){
        $this->HasMany(User::class);
    }
}
