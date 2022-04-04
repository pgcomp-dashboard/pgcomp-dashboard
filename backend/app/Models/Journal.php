<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;

class Journal extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'stratum_qualis_id',
    ];


    public function hasQualis(){
        return $this->hasOne(StratumQualis::class, 'stratum_qualis_id');
    }

    public static function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
                'required',
            ]
        ];
    }

    public static function updateRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
                'required',
            ]
        ];
    }

    public function findAll() {
        return Journal::all();
    }

    public function deleteJournal($title)
    {
        $journal = new Journal();
        $journal = Journal::where('name', $title)->first();
        if(empty($journal)){
            return 'error';
        }
        $journal->delete();
    }

    public static function createOrUpdateJournal(array $data): Journal
    {
        return Journal::updateOrCreateModel(
            Arr::only($data, ['name']),
            $data
        );
    }
}
