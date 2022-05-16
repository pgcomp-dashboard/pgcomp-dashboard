<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class TimeInterval extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'started_at',
        'finished_at'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public static function creationRules(): array
    {
        return [
            'started_at' => 'date',
            'finished_at' => 'date|nullable',
            'users_id' => [
                'int',
                Rule::exists(User::class, 'id'),
                'required'
            ],
        ];
    }

    public function updateRules(): array
    {
        return [
            'started_at' => 'date',
            'finished_at' => 'date|nullable',
            'users_id' => [
                'int',
                Rule::exists(User::class, 'id'),
                'required'
            ],
        ];
    }

    public function user(){
        return $this->belongsTo(User::class, 'users_id');
    }
}
