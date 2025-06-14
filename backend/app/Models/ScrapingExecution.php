<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScrapingExecution extends Model
{
    protected $fillable = ['executed_at'];
    protected $casts = [
        'executed_at' => 'datetime',
    ];
}
