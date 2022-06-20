<?php

namespace App\Models;

use Illuminate\Validation\Rule;

class UsersSubarea extends BaseModel
{
    protected $fillable = [
        'users_id',
        'subareas_id',
    ];

    /**
     * @return array creation rules to validate attributes.
     */
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

    /**
     * @return array update rules to validate attributes.
     */
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

    /**
     * Establish a has-many relationship with the user model
     *
     * @return HasMany Relation that an usersSubarea has more than one users
     */
    public function users(){
        $this->HasMany(User::class);
    }
}
