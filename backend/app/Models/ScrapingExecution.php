<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScrapingExecution extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'command',
        'executed_at',
    ];
    protected $casts = [
        'executed_at' => 'datetime',
    ];
}
