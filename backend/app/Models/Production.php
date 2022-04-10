<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;

class Production extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'title',
        'year',
        'journals_id',
//       'user_id', TODO: Adicionar o campo de user id
    //  'doi', TODO: Adicionar o campo doi também.
    ];

    public function isWroteBy()
    {
        return $this->belongsToMany(User::class);
    }

    public function hasQualis(){
        return $this->hasOne(Journal::class, 'journals_id');
    }

    public static function creationRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'year' => 'required|int',
            'journals_id' => [
                'nullable',
                'int',
                Rule::exists(Journal::class, 'id'),
                'required',
            ]
        ];
    }

    public function updateRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'year' => 'required|int',
            'journals_id' => [
                'nullable',
                'int',
                Rule::exists(Journal::class, 'id'),
                'required',
            ]
        ];
    }

    public function findAll() {
        return Production::all();
    }

    public function deleteProduction($title)
    {
        $production = new Production();
        $production = Production::where('title', $title)->first();
        if(empty($production)){
            return 'error';
        }
        $production->delete();
    }

    public static function createOrUpdateProduction(array $data): Production
    {
        return Production::updateOrCreateModel(
            Arr::only($data, ['title']),
            $data
        );
    }

}
