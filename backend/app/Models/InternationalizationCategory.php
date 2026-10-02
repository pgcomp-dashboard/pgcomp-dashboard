<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternationalizationCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function actions(): HasMany
    {
        return $this->hasMany(InternationalizationAction::class, 'category_id');
    }
}
