<?php

namespace App\Models;

use Illuminate\Validation\Rule;

class UsersProgram extends BaseModel
{
    protected $fillable = [
        'user_id',
        'program_id',
        'started_at',
        'finished_at'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime'
    ];

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

    public function program(){
        return $this->belongsTo(Program::class, 'program_id');
    }

    public static function creationRules(): array
    {
        return [
            'user_id' => [
                'int',
                'required',
                Rule::exists(User::class, 'id')
            ],
            'program_id' => [
                'int',
                'required',
                Rule::exists(Program::class, 'id')
            ],
            'started_at' => 'date|required',
            'finished_at' => 'date|nullable'

        ];
    }

    public function updateRules(): array
    {
        return [
            'user_id' => [
                'int',
                'required',
                Rule::exists(User::class, 'id')
            ],
            'program_id' => [
                'int',
                'required',
                Rule::exists(Program::class, 'id')
            ],
            'started_at' => 'date|required',
            'finished_at' => 'date|nullable'
        ];
    }
}
